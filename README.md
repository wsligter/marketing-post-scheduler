# Marketing Post Scheduler

A full-stack application for planning and scheduling marketing campaigns across social media platforms. Built with Node.js, React, MongoDB, and Docker.

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Just](https://github.com/casey/just#installation) (optional, for simplified commands)

### Run the Application

**With Docker (recommended):**

```bash
# Using Docker directly
docker-compose up

# OR using Just (if installed)
just start
```

**For Development (without Docker):**

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### Access the Application

- **Frontend:** http://localhost:8081
- **Backend API:** http://localhost:3000
- **MongoDB:** mongodb://localhost:27017/marketingapp

## Features

- Create and manage marketing campaigns
- Schedule social media posts
- Track campaign performance
- Centralized content management

## Project Structure

```plaintext
marketing_tool/
├── backend/           # Express.js API
├── frontend/          # React frontend
├── database/          # MongoDB data (volume mount)
├── docker-compose.yml # Docker configuration
├── justfile           # Task runner for common commands
└── README.md          # This file
```

## Command Reference

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Just Commands

If you have [Just](https://github.com/casey/just#installation) installed:

```bash
# List all available commands
just

# Common commands
just start           # Start all containers
just start-detached  # Start in background
just stop            # Stop all containers
just logs            # View all logs
just logs-service backend  # View specific service logs
just rebuild         # Rebuild and restart
just status          # Show container status
```

## License

MIT
