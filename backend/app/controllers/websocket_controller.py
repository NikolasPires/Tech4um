from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import WebSocket, status
from app.repositories.websocket_repository import WebSocketRepository, ws_repository
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import MessageCreate

class WebSocketController:
    def __init__(self, db: AsyncSession, ws_repo: WebSocketRepository = ws_repository):
        self.db = db
        self.ws_repo = ws_repo
        self.chat_repo = ChatRepository(db)

    async def generate_ticket(self, user_id: int, room_id: int, username: str) -> str:
        participant = await self.chat_repo.get_participant(room_id, user_id)
        if not participant:
            raise ValueError("O usuário não é participante desta sala")
        return await self.ws_repo.generate_ticket(user_id, room_id, username)

    async def handle_connection(self, websocket: WebSocket, room_id: int, ticket: str):
        # 1. Valida o ticket
        ticket_data = await self.ws_repo.validate_and_consume_ticket(ticket)
        if not ticket_data:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        user_id = ticket_data["user_id"]
        # Verifica se a sala do ticket coincide com o path
        if ticket_data["room_id"] != room_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # 2. Verifica se o usuário é participante
        participant = await self.chat_repo.get_participant(room_id, user_id)
        if not participant:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # 3. Conecta o websocket no repositório de infraestrutura
        await self.ws_repo.connect(websocket, room_id, user_id)

        # 4. Define o status do usuário como online no Redis
        is_now_online = await self.ws_repo.set_user_online(user_id)
        
        # 5. Notifica os usuários da sala sobre a entrada e se ficou online
        await self.ws_repo.publish_to_room(
            room_id,
            {
                "event": "user_joined",
                "user_id": user_id,
            }
        )
        if is_now_online:
            await self.ws_repo.publish_to_room(
                room_id,
                {
                    "event": "user_online",
                    "user_id": user_id,
                }
            )

        try:
            while True:
                payload = await websocket.receive_json()
                event_type = payload.get("event")

                if event_type == "typing_status":
                    is_typing = payload.get("is_typing", False)
                    recipient_id = payload.get("recipient_id")

                    response = {
                        "event": "user_typing",
                        "user_id": user_id,
                        "room_id": room_id,
                        "is_typing": is_typing,
                        "recipient_id": recipient_id
                    }

                    if recipient_id is not None:
                        # Mensagem privada: avisa o destinatário específico
                        await self.ws_repo.publish_to_user(recipient_id, response)
                    else:
                        # Mensagem pública: avisa a sala (exceto quem digita)
                        response["exclude_user_id"] = user_id
                        await self.ws_repo.publish_to_room(room_id, response)
                    continue

                # Envio de nova mensagem
                message_text = payload.get("message")
                if not message_text:
                    continue

                recipient_id = payload.get("recipient_id")

                message_create = MessageCreate(
                    room_id=room_id,
                    message=message_text,
                    recipient_id=recipient_id,
                )

                # Salva no banco de dados usando o repositório de banco de dados
                saved_message = await self.chat_repo.create_message(message_create, user_id)

                response = {
                    "event": "new_message",
                    "id": saved_message.id,
                    "room_id": room_id,
                    "user_id": user_id,
                    "recipient_id": recipient_id,
                    "message": saved_message.message,
                    "created_at": saved_message.created_at.isoformat(),
                }

                if recipient_id is not None:
                    # Envia para o destinatário no canal privado
                    await self.ws_repo.publish_to_user(recipient_id, response)
                    # Envia de volta para o remetente (no seu canal privado)
                    await self.ws_repo.publish_to_user(user_id, response)

                    # Publica notificação em tempo real via canal de notificações do destinatário
                    sender_name = participant.user.name if participant.user else f"Usuário {user_id}"
                    room_obj = await self.chat_repo.get_room_by_id(room_id)
                    room_name = room_obj.name if room_obj else f"Sala {room_id}"

                    notification_event = {
                        "event": "private_message_notification",
                        "sender_name": sender_name,
                        "room_name": room_name,
                        "room_id": room_id,
                        "message": saved_message.message,
                    }
                    await self.ws_repo.publish_to_user(recipient_id, notification_event)
                else:
                    # Publica para todos os membros no canal da sala
                    await self.ws_repo.publish_to_room(room_id, response)

        except Exception as e:
            import traceback
            print(f"[WS CONTROLLER] Error in handle_connection: {e}", flush=True)
            traceback.print_exc()
        finally:
            # Desconecta o WebSocket local
            await self.ws_repo.disconnect(websocket, room_id, user_id)
            
            # Decrementa conexões globais no Redis
            is_now_offline = await self.ws_repo.set_user_offline(user_id)
            
            # Notifica que o usuário saiu do canal
            await self.ws_repo.publish_to_room(
                room_id,
                {
                    "event": "user_left",
                    "user_id": user_id,
                }
            )
            if is_now_offline:
                # Notifica que ficou offline globalmente
                await self.ws_repo.publish_to_room(
                    room_id,
                    {
                        "event": "user_offline",
                        "user_id": user_id,
                    }
                )
