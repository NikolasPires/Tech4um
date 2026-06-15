# Tech4um 🚀

### Visão Geral
O **Tech4um** é um fórum tecnológico em tempo real projetado para criar um ambiente de colaboração, compartilhamento de descobertas e insights entre os membros do time Tech4humans. A aplicação foi desenvolvida utilizando **React (TypeScript)** no frontend e **FastAPI** no backend, com suporte a **WebSockets** para comunicação instantânea e segura em salas de chat.

---

## 🚀 Funcionalidades e Diferenciais do Projeto
- Login e autenticação
- Dashboard de fóruns
- Criação de salas
- Chat em tempo real e Mensagens Privadas
- Testes automatizados (Testes de integração)
- Arquitetura Frontend que proporciona desenvolvimento ágil (Definição de Temas e Componentização)
- Criação de hooks performáticos com Tanstack Query
- Facilidade de Execução de Ambiente com Containers Docker
- Arquitetura em Camadas (Mix de MVC e Clean Code)


## 🏗️ Arquitetura e Tecnologias

- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12)
- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/) + [MUI (Material UI)](https://mui.com/)
- **Banco de Dados:** [PostgreSQL 16](https://www.postgresql.org/)
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

---

## ⚙️ Variáveis de Ambiente

### Backend (`/backend/.env`)
Crie o arquivo `.env` dentro da pasta `backend` baseando-se nas variáveis abaixo:
```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/tech4um
SECRET_KEY=sua_chave_secreta_super_segura_aqui
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
> ⚠️ **Nota:** No Docker, a URL do banco usa o host `db` (nome do serviço no Compose). Localmente, substitua por `localhost` ou o IP correspondente.

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
Isso iniciará o banco de dados PostgreSQL e o container unificado da aplicação.

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

### Passo 1: Banco de Dados
1. Certifique-se de que o PostgreSQL está ativo e crie um banco de dados chamado `tech4um`.
2. Configure o arquivo `backend/.env` com a string de conexão correta (ex: `DATABASE_URL=postgresql+psycopg2://postgres:senha@localhost:5432/tech4um`).

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

O projeto conta com testes de integração automatizados para garantir a estabilidade e a corretude das regras de negócio do sistema.

### O que o teste valida?
O arquivo de teste [test_featured.py](file:///home/nikolas/Tech4um/backend/tests/test_featured.py) valida ponta a ponta a funcionalidade do algoritmo de "Tópico em Destaque":
- Cria múltiplos fóruns/salas temporárias na base de dados de testes.
- Distribui o volume de mensagens de maneira desigual entre as salas nas últimas 24 horas.
- Faz requisições HTTP reais de listagem de salas contra o app FastAPI usando `httpx.AsyncClient`.
- Garante que a API responde com a flag `featured: true` exatamente para as **3 salas mais ativas**.
- Confirma que as salas menos ativas ou recém-criadas permanecem sem destaque (`featured: false`).

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
- **Serviço de WebSocket:** As conexões em tempo real das salas de chat utilizam a rota `/chat/ws/rooms/{room_id}?user_id={user_id}`.
