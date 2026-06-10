FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
WORKDIR /app/frontend
RUN npm install

WORKDIR /app
COPY frontend/ ./frontend/


WORKDIR /app/frontend
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]