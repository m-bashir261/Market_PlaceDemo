# Market Place

A full-stack MERN marketplace application (MongoDB, Express, React, Node.js) running in Docker for a consistent development experience across all machines.

## Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Frontend | React 19            |
| Backend  | Express 5 (Node 22) |
| Database | MongoDB 7           |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**

> That's it — no need to install Node.js, npm, or MongoDB locally.

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd Market_Place

# 2. Create your environment file
cp .env.example .env

# 3. (Optional) Edit .env to adjust values to your needs

# 4. Start all services
docker compose up --build
```

The first run will take a few minutes to download images and install dependencies. Subsequent starts are much faster thanks to Docker layer caching.

### Access Points

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:3000    |
| Backend  | http://localhost:5000    |
| MongoDB  | localhost:27017          |

## Development Workflow

### Hot-Reload

Both the frontend and backend support **hot-reload** — edit files on your machine and changes are reflected instantly inside the containers:

- **Frontend**: React dev server watches for changes automatically
- **Backend**: Node.js `--watch` flag restarts the server on file changes

No rebuild needed for code changes.

### When to Rebuild

You only need to run `docker compose up --build` again if you:

- Add/remove/update a dependency in `package.json`
- Modify a `Dockerfile`
- Change `compose.yaml`

### Common Commands

```bash
# Start all services (with build)
docker compose up --build

# Start in the background (detached mode)
docker compose up --build -d

# Stop all services
docker compose down

# Stop and remove the database volume (fresh DB)
docker compose down -v

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo

# Check running containers
docker compose ps

# Restart a single service
docker compose restart backend
```

## Project Structure

```
Market_Place/
├── Backend/
│   ├── controllers/       # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── server.js          # Entry point
│   ├── Dockerfile         # Backend dev container
│   └── .dockerignore
├── Frontend/
│   ├── public/
│   ├── src/               # React source code
│   ├── Dockerfile         # Frontend dev container
│   └── .dockerignore
├── compose.yaml           # Docker Compose orchestration
├── .env.example           # Environment variable template (committed)
├── .env                   # Your local env config (gitignored)
└── README.md
```

## Environment Variables

Configuration is managed through a `.env` file. The repo includes a `.env.example` template — each developer copies it and adjusts values to their needs.

| Variable         | Default       | Description              |
|------------------|---------------|--------------------------|
| MONGO_USERNAME   | root          | MongoDB root username    |
| MONGO_PASSWORD   | example       | MongoDB root password    |
| PORT             | 5000          | Backend server port      |
| NODE_ENV         | development   | Node environment         |

> **Important**: The `.env` file is gitignored. Never commit it — use `.env.example` to share changes with the team.

## Troubleshooting

### `docker compose up` fails with a pipe error

```
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Fix**: Docker Desktop is not running. Open it from the Start menu and wait for it to fully start.

### `npm ci` / `npm install` fails during build

```
npm ci can only install packages when your package.json and package-lock.json are in sync.
```

**Fix**: Run `docker compose build --no-cache` to force a clean rebuild.

### Frontend changes not reflecting

Make sure `WATCHPACK_POLLING` is set to `"true"` in `compose.yaml` (it is by default). This enables file watching inside Docker on Windows and macOS.