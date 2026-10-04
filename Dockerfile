FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY src ./src

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=256
EXPOSE 3000
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
