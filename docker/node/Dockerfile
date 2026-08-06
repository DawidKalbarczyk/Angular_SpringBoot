FROM node:24
LABEL maintainer="Dawid Kalbarczyk"

WORKDIR app

COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm install

ENV CI=false

CMD ["npm", "start"]