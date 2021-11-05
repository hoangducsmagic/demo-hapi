FROM node:12.19.1-alpine3.12

# ARG NODE_ENV
# ENV NODE_ENV=$NODE_ENV

WORKDIR /app

# COPY ./start.sh /app/start.sh
# RUN chmod +x /app/start.sh

COPY ./dist ./dist
COPY ./package.json ./package.json
RUN npm i --production

CMD [ "node", "/app/dist/src/server.js"]