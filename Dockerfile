FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
COPY src ./src

# prisma.config.ts needs DATABASE_URL to exist at build time; the real value is supplied at runtime
RUN DATABASE_URL="mysql://build:build@localhost:3306/build" npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]