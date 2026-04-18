FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]