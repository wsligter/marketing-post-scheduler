# Marketing Tool Justfile
# Run commands with: just <command>

# List available commands
default:
    @just --list

# Start all containers
start:
    docker-compose up

# Start all containers in detached mode
start-detached:
    docker-compose up -d

# Start only the backend service
start-backend:
    docker-compose up backend

# Start only the frontend service
start-frontend:
    docker-compose up frontend

# Start only the database service
start-db:
    docker-compose up db

# Stop all containers
stop:
    docker-compose down

# Stop all containers and remove volumes
clean:
    docker-compose down -v

# View logs of all services
logs:
    docker-compose logs

# View logs of a specific service (usage: just logs-service backend)
logs-service service:
    docker-compose logs {{service}}

# Follow logs of all services
logs-follow:
    docker-compose logs -f

# Follow logs of a specific service (usage: just logs-follow-service backend)
logs-follow-service service:
    docker-compose logs -f {{service}}

# Rebuild and start all containers
rebuild:
    docker-compose up --build

# Rebuild and start all containers in detached mode
rebuild-detached:
    docker-compose up --build -d

# Show container status
status:
    docker-compose ps
