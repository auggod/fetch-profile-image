FROM node:18-alpine AS builder

WORKDIR /var/www/api

COPY . .

RUN npm i -g npm
RUN npm install
RUN npm run build

FROM node:18-alpine

WORKDIR /var/www/api

COPY .env ./
COPY .env.example ./
COPY ./package* ./
COPY ./index.js ./

COPY --from=builder /var/www/api/node_modules ./node_modules
COPY --from=builder /var/www/api/lib ./lib

EXPOSE 3000

CMD ["npm", "start"]
