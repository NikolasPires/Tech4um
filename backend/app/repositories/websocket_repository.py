import json
import asyncio
from collections import defaultdict
import redis.asyncio as aioredis
from fastapi import WebSocket
from app.core.config import REDIS_URL

class WebSocketRepository:
    def __init__(self, redis_url: str = REDIS_URL):
        self.redis = aioredis.from_url(
            redis_url,
            decode_responses=True,
            socket_keepalive=True,
            health_check_interval=0,
            socket_timeout=None
        )
        # local_connections[room_id][user_id] = [websocket1, websocket2, ...]
        self.local_connections: dict[int, dict[int, list[WebSocket]]] = defaultdict(dict)
        self.room_tasks: dict[int, asyncio.Task] = {}
        self.user_tasks: dict[int, asyncio.Task] = {}
        self.room_ready_events: dict[int, asyncio.Event] = {}
        self.user_ready_events: dict[int, asyncio.Event] = {}

    async def generate_ticket(self, user_id: int, room_id: int, username: str) -> str:
        import uuid
        ticket = str(uuid.uuid4())
        # Expire em 15 segundos
        await self.redis.setex(
            f"ws_ticket:{ticket}",
            15,
            json.dumps({"user_id": user_id, "room_id": room_id, "username": username})
        )
        return ticket

    async def validate_and_consume_ticket(self, ticket: str) -> dict | None:
        key = f"ws_ticket:{ticket}"
        data_str = await self.redis.get(key)
        if not data_str:
            return None
        await self.redis.delete(key) # Single-use ticket
        return json.loads(data_str)

    async def set_user_online(self, user_id: int) -> bool:
        # Incrementa o contador de conexões ativas do usuário no Redis
        count = await self.redis.incr(f"user_online_count:{user_id}")
        # Garante que está no set de usuários online
        await self.redis.sadd("online_users", str(user_id))
        # Se for a primeira conexão, ele mudou de offline para online
        return count == 1

    async def set_user_offline(self, user_id: int) -> bool:
        # Decrementa o contador de conexões ativas
        count = await self.redis.decr(f"user_online_count:{user_id}")
        if count <= 0:
            # Remove do set de usuários online e zera
            await self.redis.srem("online_users", str(user_id))
            await self.redis.delete(f"user_online_count:{user_id}")
            return True
        return False

    async def is_user_online(self, user_id: int) -> bool:
        return await self.redis.sismember("online_users", str(user_id))

    async def get_online_users(self) -> set[int]:
        members = await self.redis.smembers("online_users")
        return {int(m) for m in members}

    def get_user_websockets(self, user_id: int) -> list[WebSocket]:
        websockets = []
        for room_id, user_map in self.local_connections.items():
            if user_id in user_map:
                websockets.extend(user_map[user_id])
        return websockets

    async def connect(self, websocket: WebSocket, room_id: int, user_id: int):
        await websocket.accept()
        if user_id not in self.local_connections[room_id]:
            self.local_connections[room_id][user_id] = []
        self.local_connections[room_id][user_id].append(websocket)

        if room_id not in self.room_tasks:
            ready_event = asyncio.Event()
            self.room_ready_events[room_id] = ready_event
            self.room_tasks[room_id] = asyncio.create_task(self._listen_room_channel(room_id, ready_event))
            try:
                await asyncio.wait_for(ready_event.wait(), timeout=2.0)
            except asyncio.TimeoutError:
                pass
            finally:
                self.room_ready_events.pop(room_id, None)

        # Se for a primeira conexão do usuário nesta instância
        user_websockets = self.get_user_websockets(user_id)
        if len(user_websockets) == 1 and user_id not in self.user_tasks:
            ready_event = asyncio.Event()
            self.user_ready_events[user_id] = ready_event
            self.user_tasks[user_id] = asyncio.create_task(self._listen_user_channel(user_id, ready_event))
            try:
                await asyncio.wait_for(ready_event.wait(), timeout=2.0)
            except asyncio.TimeoutError:
                pass
            finally:
                self.user_ready_events.pop(user_id, None)

    async def disconnect(self, websocket: WebSocket, room_id: int, user_id: int):
        room_connections = self.local_connections.get(room_id)
        if room_connections and user_id in room_connections:
            if websocket in room_connections[user_id]:
                room_connections[user_id].remove(websocket)
            if not room_connections[user_id]:
                room_connections.pop(user_id, None)
            if not room_connections:
                self.local_connections.pop(room_id, None)
                # Cancela a tarefa da sala se não houver mais conexões locais
                room_task = self.room_tasks.pop(room_id, None)
                if room_task:
                    room_task.cancel()

        # Se o usuário não tiver mais conexões ativas nesta instância
        user_websockets = self.get_user_websockets(user_id)
        if not user_websockets:
            user_task = self.user_tasks.pop(user_id, None)
            if user_task:
                user_task.cancel()

    async def publish_to_room(self, room_id: int, message: dict):
        await self.redis.publish(f"room:{room_id}", json.dumps(message))

    async def publish_to_user(self, user_id: int, message: dict):
        await self.redis.publish(f"user_notifications:{user_id}", json.dumps(message))

    async def _listen_room_channel(self, room_id: int, ready_event: asyncio.Event = None):
        print(f"[WS REP] Starting _listen_room_channel loop for room {room_id}", flush=True)
        while room_id in self.local_connections:
            pubsub = None
            try:
                pubsub = self.redis.pubsub()
                await pubsub.subscribe(f"room:{room_id}")
                print(f"[WS REP] Subscribed to room:{room_id}", flush=True)
                async for message in pubsub.listen():
                    if message["type"] in ("subscribe", "unsubscribe"):
                        print(f"[WS REP] Room {room_id} subscription event: {message['type']} to {message['channel']}", flush=True)
                        if message["type"] == "subscribe" and ready_event and not ready_event.is_set():
                            ready_event.set()
                        continue
                    print(f"[WS REP] Room {room_id} received message from Redis: {message}", flush=True)
                    if message["type"] == "message":
                        data = json.loads(message["data"])
                        room_connections = self.local_connections.get(room_id, {})
                        print(f"[WS REP] Room {room_id} has local connections: {list(room_connections.keys())}", flush=True)
                        
                        recipient_id = data.get("recipient_id")
                        exclude_user_id = data.get("exclude_user_id")

                        for u_id, ws_list in list(room_connections.items()):
                            for ws in ws_list:
                                try:
                                    if recipient_id is not None:
                                        if u_id == recipient_id or u_id == data.get("user_id"):
                                            print(f"[WS REP] Sending private message to user {u_id} in room {room_id}", flush=True)
                                            await ws.send_json(data)
                                    elif exclude_user_id is not None:
                                        if u_id != exclude_user_id:
                                            print(f"[WS REP] Sending broadcast (exclude {exclude_user_id}) to user {u_id} in room {room_id}", flush=True)
                                            await ws.send_json(data)
                                    else:
                                        print(f"[WS REP] Sending broadcast to user {u_id} in room {room_id}", flush=True)
                                        await ws.send_json(data)
                                except Exception as e:
                                    print(f"[WS REP] Error sending to user {u_id}: {e}", flush=True)
            except asyncio.CancelledError:
                print(f"[WS REP] _listen_room_channel for room {room_id} was cancelled", flush=True)
                break
            except Exception as e:
                print(f"[WS REP] Connection error in _listen_room_channel for room {room_id}: {e}", flush=True)
                if ready_event and not ready_event.is_set():
                    ready_event.set()
                # Espera 1 segundo antes de tentar reconectar
                await asyncio.sleep(1)
            finally:
                if pubsub:
                    try:
                        await pubsub.unsubscribe(f"room:{room_id}")
                    except Exception:
                        pass

                    try:
                        await pubsub.aclose()
                    except Exception:
                        pass
        
        self.room_tasks.pop(room_id, None)
        print(f"[WS REP] Exited _listen_room_channel loop for room {room_id}", flush=True)

    async def _listen_user_channel(self, user_id: int, ready_event: asyncio.Event = None):
        print(f"[WS REP] Starting _listen_user_channel loop for user {user_id}", flush=True)
        while self.get_user_websockets(user_id):
            pubsub = None
            try:
                pubsub = self.redis.pubsub()
                await pubsub.subscribe(f"user_notifications:{user_id}")
                print(f"[WS REP] Subscribed to user_notifications:{user_id}", flush=True)
                async for message in pubsub.listen():
                    if message["type"] in ("subscribe", "unsubscribe"):
                        print(f"[WS REP] User {user_id} subscription event: {message['type']} to {message['channel']}", flush=True)
                        if message["type"] == "subscribe" and ready_event and not ready_event.is_set():
                            ready_event.set()
                        continue
                    print(f"[WS REP] User {user_id} received message from Redis: {message}", flush=True)
                    if message["type"] == "message":
                        data = json.loads(message["data"])
                        msg_room_id = data.get("room_id")
                        event_type = data.get("event")

                        if msg_room_id is not None and event_type != "private_message_notification":
                            websockets = self.local_connections.get(msg_room_id, {}).get(user_id, [])
                        else:
                            websockets = self.get_user_websockets(user_id)

                        print(f"[WS REP] User {user_id} has {len(websockets)} target websockets for this notification", flush=True)
                        for ws in websockets:
                            try:
                                print(f"[WS REP] Sending user notification to user {user_id}", flush=True)
                                await ws.send_json(data)
                            except Exception as e:
                                print(f"[WS REP] Error sending user notification to user {user_id}: {e}", flush=True)
            except asyncio.CancelledError:
                print(f"[WS REP] _listen_user_channel for user {user_id} was cancelled", flush=True)
                break
            except Exception as e:
                print(f"[WS REP] Connection error in _listen_user_channel for user {user_id}: {e}", flush=True)
                if ready_event and not ready_event.is_set():
                    ready_event.set()
                await asyncio.sleep(1)
            finally:
                if pubsub:
                    try:
                        await pubsub.unsubscribe(f"user_notifications:{user_id}")
                    except Exception:
                        pass

                    try:
                        await pubsub.aclose()
                    except Exception:
                        pass

        self.user_tasks.pop(user_id, None)
        print(f"[WS REP] Exited _listen_user_channel loop for user {user_id}", flush=True)

ws_repository = WebSocketRepository()
