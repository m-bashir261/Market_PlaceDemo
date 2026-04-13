# ---- Backend Dockerfile ----
FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
