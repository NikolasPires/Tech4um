# Dockerfile (Salvar na RAIZ do projeto Tech4um)
FROM nikolaik/python-nodejs:python3.12-nodejs20-slim

ARG APP_HOME=/app
WORKDIR ${APP_HOME}

ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt ./backend/requirements.txt
COPY frontend/package*.json ./frontend/


RUN pip install --no-cache-dir -r ./backend/requirements.txt

WORKDIR ${APP_HOME}/frontend
RUN npm install

WORKDIR ${APP_HOME}
COPY . ${APP_HOME}

EXPOSE 8000 3000

CMD ["sh", "-c", "tail -f /dev/null"]