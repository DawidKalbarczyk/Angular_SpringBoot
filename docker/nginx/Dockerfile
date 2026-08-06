FROM node:24 AS build
WORKDIR /app

ARG NGINX_PORT
ENV ANGULAR_PORT=$NGINX_PORT
ENV PUBLIC_URL=""

COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm install
COPY frontend/ .

RUN npm run build

FROM nginx:alpine

COPY config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]