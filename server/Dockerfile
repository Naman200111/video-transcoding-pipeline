FROM node:20-alpine

RUN apk update
RUN apk add --no-cache ffmpeg

WORKDIR /home/app

COPY src/containers/package.json package.json
COPY src/containers/package-lock.json package-lock.json

RUN npm install

COPY src/containers/index.js index.js

ENTRYPOINT ["npm", "start"]