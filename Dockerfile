FROM node:20-alpine AS builder

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY frontend/tsconfig.json frontend/vite.config.ts ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

WORKDIR /app/frontend
RUN npm install
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
