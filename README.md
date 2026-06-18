# Tech4um 🚀

### Visão Geral
O **Tech4um** é um fórum tecnológico em tempo real projetado para criar um ambiente de colaboração, compartilhamento de descobertas e insights entre os membros do time Tech4humans. A aplicação foi desenvolvida utilizando **React (TypeScript)** no frontend e **FastAPI** no backend, com suporte a **WebSockets** para comunicação instantânea e segura em salas de chat.

---

## 🚀 Funcionalidades e Diferenciais do Projeto
- Login e autenticação com JWT e controle de expiração
- Revogação ativa de tokens JWT em logout usando **Blacklist no Redis**
- Cadastro de usuários com validação estrita de senhas (mínimo de 8 caracteres, maiúscula, minúscula e número)
- Dashboard de fóruns com listagem otimizada
- Chat em tempo real e Mensagens Privadas com controle de digitação em tempo real
- Autenticação de WebSockets segura baseada em **Tickets de uso único** com expiração de 15 segundos no Redis
- Testes automatizados (Testes de integração e de validação de schemas)
- Arquitetura Frontend moderna com definição de Temas, Componentização e suporte a estado de conexão em tempo real
- Criação de hooks performáticos com Tanstack Query
- Facilidade de Execução de Ambiente com Containers Docker
- Arquitetura em Camadas (Mix de MVC e Clean Code)
- Monitoramento de erros e desempenho com Sentry


## 🏗️ Arquitetura e Tecnologias

- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12)
- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/) + [MUI (Material UI)](https://mui.com/)
- **Banco de Dados:** [PostgreSQL 16](https://www.postgresql.org/)
- **Armazenamento de Estado & Pub/Sub:** [Redis](https://redis.io/) (utilizado para controle de tickets WebSocket, cache de status online e blacklist de JWT)
- **ORM & Migrações:** [SQLAlchemy](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/)
- **Containerização:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

### Caso utilize Docker (Recomendado):
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)

### Caso rode Localmente (Sem Docker):
- **Python** (v3.12+)
- **Node.js** (v20+) e **npm**
- **PostgreSQL** (v16+) instalado e rodando localmente
- **Redis** instalado e rodando localmente

---

## ⚙️ Variáveis de Ambiente

### Backend (`/backend/.env`)
Crie o arquivo `.env` dentro da pasta `backend` baseando-se nas variáveis abaixo:
```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/tech4um
REDIS_URL=redis://redis:6379/0
SECRET_KEY=sua_chave_secreta_super_segura_aqui
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend (`/frontend/.env`)
Crie o arquivo `.env` dentro da pasta `frontend`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🐳 Execução com Docker (Ambiente Dev Container / Compose)

O projeto está configurado para subir um ambiente integrado. O container da aplicação (`tech4um-app`) serve como ambiente de trabalho mantido ativo em background.

### Passo 1: Subir os Containers
Na raiz do projeto, execute:
```bash
docker compose up -d
```
Isso iniciará o banco de dados PostgreSQL, o Redis e o container unificado da aplicação.

### Passo 2: Entrar no Container da Aplicação
Para executar comandos e rodar os servidores, acesse o terminal do container da aplicação:
```bash
docker exec -it tech4um-app bash
```

### Passo 3: Executar as Migrações do Banco de Dados
Dentro do container da aplicação, execute:
```bash
cd backend
alembic upgrade head
```

### Passo 4: Iniciar o Servidor Backend (FastAPI)
Abra um terminal (ou execute em background/nova aba do container) e inicie o backend:
```bash
cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
A API estará disponível em `http://localhost:8000`.

### Passo 5: Iniciar o Servidor Frontend (Vite)
Acesse a pasta do frontend e inicie o servidor de desenvolvimento:
```bash
cd /app/frontend
npm run dev
```
O frontend estará disponível em `http://localhost:3000`.

---

## 💻 Execução Local (Sem Docker)

Se preferir rodar a aplicação diretamente no seu host local:

### Passo 1: Banco de Dados e Redis
1. Certifique-se de que o PostgreSQL está ativo e crie um banco de dados chamado `tech4um`.
2. Certifique-se de que a instância do Redis está ativa na porta padrão (6379).
3. Configure o arquivo `backend/.env` com as strings de conexões corretas (ex: `DATABASE_URL=postgresql+psycopg2://postgres:senha@localhost:5432/tech4um` e `REDIS_URL=redis://localhost:6379/0`).

### Passo 2: Configurar e Rodar o Backend
1. Navegue até a pasta `backend`:
   ```bash
   cd backend
   ```
2. Crie e ative um ambiente virtual Python:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Execute as migrações da base de dados:
   ```bash
   alembic upgrade head
   ```
5. Inicie a aplicação com Uvicorn:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Passo 3: Configurar e Rodar o Frontend
1. Abra um novo terminal e navegue até a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências npm:
   ```bash
   npm install
   ```
3. Inicie o servidor Vite:
   ```bash
   npm run dev
   ```
4. Acesse a aplicação no navegador em `http://localhost:3000`.

---

## 🗃️ Comandos Úteis do Alembic (Migrações)

Sempre execute os comandos do Alembic de dentro da pasta `backend`:

- **Aplicar migrações pendentes:** `alembic upgrade head`
- **Reverter última migração:** `alembic downgrade -1`
- **Criar nova migração automaticamente:** `alembic revision --autogenerate -m "descricao_da_mudanca"`
- **Verificar histórico de migrações:** `alembic history`

---

## 🧪 Testes Automatizados

O projeto conta com testes de integração e testes de validação de schemas automatizados para garantir a estabilidade e a segurança do sistema.

### O que os testes validam?
1. **Destaque de Salas ([test_featured.py](file:///home/nikolas/Tech4um/backend/tests/test_featured.py)):** Valida o algoritmo de "Tópicos em Destaque", verificando se as 3 salas com maior número de mensagens nas últimas 24h são marcadas corretamente como destaque pela API.
2. **Complexidade de Senhas ([test_auth_password_blacklist.py](file:///home/nikolas/Tech4um/backend/tests/test_auth_password_blacklist.py)):** Valida as regras de validação do Pydantic para o cadastro de novos usuários, assegurando a rejeição de senhas curtas ou fracas (sem letras maiúsculas, minúsculas ou números).

### Como executar os testes?

#### Utilizando Docker (Recomendado):
Execute o comando abaixo diretamente no terminal do seu host:
```bash
docker exec tech4um-app bash -c "cd /app/backend && PYTHONPATH=. /app/.venv/bin/pytest"
```

#### Executando Localmente (Sem Docker):
Com o ambiente virtual ativo no diretório `/backend`:
```bash
cd backend
PYTHONPATH=. pytest
```

---

## 🧑‍💻 Notas para o Desenvolvedor

- **Endpoints da API:** A documentação interativa Swagger está disponível em `http://localhost:8000/docs`.
- **Rotas Protegidas:** As rotas de listagem e dados de usuários (`GET /users` e `GET /users/{user_id}`) e histórico de mensagens exigem autenticação do cabeçalho Bearer Token JWT. Acesso anônimo ou sem participação na sala será bloqueado.
- **Serviço de WebSocket:** As conexões em tempo real utilizam tickets de uso único armazenados no Redis (expiram em 15 segundos). As rotas de conexão são:
  - `/chat/ws/rooms/{room_id}/{ticket}`: Para chats e eventos internos das salas.
  - `/chat/ws/notifications/{ticket}`: Para o canal de notificações globais em tempo real.
