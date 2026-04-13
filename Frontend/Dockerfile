# ---- Frontend Development Dockerfile ----
FROM node:22-alpine

WORKDIR /app

# Install dependencies (done separately for Docker layer caching)
COPY package.json package-lock.json* ./
RUN npm install

# Source code is mounted as a volume in compose.yaml —
# this COPY is only a fallback if volumes are not used.
COPY . .

EXPOSE 3000

# React dev server with hot-reload
CMD ["npm", "start"]
