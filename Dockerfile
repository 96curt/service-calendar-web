# Development Container

FROM node:18 

RUN npm install -g npm@9.2.0

WORKDIR /app

COPY . .

RUN npm i