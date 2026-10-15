
FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["npm", "start"]
