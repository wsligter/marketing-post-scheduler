# Marketing Tool Justfile
# Run commands with: just <command>

# List available commands
default:
    @just --list

# Check if Docker is running, if not try to start it
check-docker:
    #!/usr/bin/env bash
    echo "Checking if Docker daemon is running..."
    if ! docker info > /dev/null 2>&1; then
        echo "Docker daemon is not running. Attempting to start Docker..."
        open -a Docker
        # Wait for Docker to start (up to 30 seconds)
        for i in {1..30}; do
            if docker info > /dev/null 2>&1; then
                echo "Docker daemon is now running."
                break
            fi
            echo "Waiting for Docker to start... ($i/30)"
            sleep 1
        done
        
        # Final check
        if ! docker info > /dev/null 2>&1; then
            echo "Failed to start Docker daemon. Please start Docker Desktop manually."
            exit 1
        fi
    else
        echo "Docker daemon is running."
    fi

# Helper recipe to check and kill processes using ports
check-ports:
    #!/usr/bin/env bash
    # Check backend port (3000)
    echo "Checking for processes using backend port 3000..."
    if lsof -i :3000 > /dev/null; then
        echo "Found process using port 3000. Attempting to kill..."
        lsof -i :3000 -t | xargs kill -9 || true
        echo "Process killed."
    else
        echo "No process found using port 3000."
    fi
    
    # Check frontend port (8081)
    echo "Checking for processes using frontend port 8081..."
    if lsof -i :8081 > /dev/null; then
        echo "Found process using port 8081. Attempting to kill..."
        lsof -i :8081 -t | xargs kill -9 || true
        echo "Process killed."
    else
        echo "No process found using port 8081."
    fi
    
    # Check MongoDB port (27017)
    echo "Checking for processes using MongoDB port 27017..."
    if lsof -i :27017 > /dev/null; then
        echo "Found process using port 27017. Attempting to kill..."
        lsof -i :27017 -t | xargs kill -9 || true
        echo "Process killed."
    else
        echo "No process found using port 27017."
    fi

# Start all containers (stopping any existing ones first)
# Optional parameters: backend-port, frontend-port, db-port
start backend-port="3000" frontend-port="8081" db-port="27017": stop check-ports check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} DB_PORT={{db-port}} docker-compose up

# Start all containers in detached mode (stopping any existing ones first)
# Optional parameters: backend-port, frontend-port, db-port
start-detached backend-port="3000" frontend-port="8081" db-port="27017": stop check-ports check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} DB_PORT={{db-port}} docker-compose up -d

# Start only the backend service
# Optional parameters: backend-port, frontend-port
start-backend backend-port="3000" frontend-port="8081": check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up backend

# Start only the frontend service
# Optional parameters: backend-port, frontend-port
start-frontend backend-port="3000" frontend-port="8081": check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up frontend

# Start only the database service
# Optional parameters: db-port
start-db db-port="27017": check-docker
    DB_PORT={{db-port}} docker-compose up db

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

# Build all containers without starting them
# Optional parameters: backend-port, frontend-port, db-port
build backend-port="3000" frontend-port="8081" db-port="27017": stop check-ports check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} DB_PORT={{db-port}} docker-compose build

# Build and start all containers (stopping any existing ones first)
# Optional parameters: backend-port, frontend-port, db-port
build-start backend-port="3000" frontend-port="8081" db-port="27017": stop check-ports check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} DB_PORT={{db-port}} docker-compose up --build

# Build and start all containers in detached mode (stopping any existing ones first)
# Optional parameters: backend-port, frontend-port, db-port
build-start-detached backend-port="3000" frontend-port="8081" db-port="27017": stop check-ports check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} DB_PORT={{db-port}} docker-compose up --build -d

# Show container status
status:
    docker-compose ps

# Bump version (major, minor, or patch)
version-bump type:
    node version-bump.js {{type}}

# Bump patch version
bump-patch:
    node version-bump.js patch

# Bump minor version
bump-minor:
    node version-bump.js minor

# Bump major version
bump-major:
    node version-bump.js major
