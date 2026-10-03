FROM node:26.7-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --allow-remote=all

COPY index.html tsconfig*.json vite.config.ts ./
COPY src ./src
RUN npm run build

FROM build AS test

ENTRYPOINT ["npm", "run", "test:ci"]

FROM nginx:1.28-alpine

ENV BACKEND_URL=http://backend:8080 \
    DNS_RESOLVER=127.0.0.11 \
    NGINX_ENVSUBST_FILTER="^(BACKEND_URL|DNS_RESOLVER)$"

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
