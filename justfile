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
    # Check backend port (3002)
    echo "Checking for processes using backend port 3002..."
    if lsof -i :3002 > /dev/null; then
        echo "Found process using port 3002. Attempting to kill..."
        lsof -i :3002 -t | xargs kill -9 || true
        echo "Process killed."
    else
        echo "No process found using port 3002."
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

# Start all containers (stopping any existing ones first) and open browser
# Optional parameters: backend-port, frontend-port
start backend-port="3002" frontend-port="8081": stop check-ports check-docker
    #!/usr/bin/env bash
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up &
    # Wait for frontend to start (increased delay to ensure app is fully built)
    sleep 45
    # Open browser
    open http://localhost:{{frontend-port}}

# Start all containers in dev mode (nodemon for backend) and open browser
# Optional parameters: backend-port, frontend-port
start-dev backend-port="3002" frontend-port="8081": stop check-ports check-docker
    #!/usr/bin/env bash
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose -f docker-compose.yml -f docker-compose.dev.yml up &
    # Browser auto-open disabled for dev runs

# Start all containers in detached mode (stopping any existing ones first) and open browser
# Optional parameters: backend-port, frontend-port
start-detached backend-port="3002" frontend-port="8081": stop check-ports check-docker
    #!/usr/bin/env bash
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up -d
    # Wait for frontend to start (increased delay to ensure app is fully built)
    sleep 45
    # Open browser
    open http://localhost:{{frontend-port}}

# Start only the backend service
# Optional parameters: backend-port, frontend-port
start-backend backend-port="3002" frontend-port="8081": check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up backend

# Start only the frontend service and open browser
# Optional parameters: backend-port, frontend-port
start-frontend backend-port="3002" frontend-port="8081": check-docker
    #!/usr/bin/env bash
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up frontend &
    # Wait for frontend to start (increased delay to ensure app is fully built)
    sleep 45
    # Open browser
    open http://localhost:{{frontend-port}}

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
# Optional parameters: backend-port, frontend-port
build backend-port="3002" frontend-port="8081": stop check-ports check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose build

# Build only the frontend container
# Optional parameters: backend-port, frontend-port
build-frontend backend-port="3002" frontend-port="8081": check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose build frontend

# Build only the backend container
# Optional parameters: backend-port, frontend-port
build-backend backend-port="3002" frontend-port="8081": check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose build backend

# Build and start all containers (stopping any existing ones first) and open browser
# Optional parameters: backend-port, frontend-port
build-start backend-port="3002" frontend-port="8081": stop check-ports check-docker
    #!/usr/bin/env bash
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up --build &
    # Wait for frontend to start (increased delay to ensure app is fully built)
    sleep 45
    # Open browser
    open http://localhost:{{frontend-port}}

# Build and start all containers in detached mode (stopping any existing ones first) and open browser
# Optional parameters: backend-port, frontend-port
build-start-detached backend-port="3002" frontend-port="8081": stop check-ports check-docker
    #!/usr/bin/env bash
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up --build -d
    # Wait for frontend to start (increased delay to ensure app is fully built)
    sleep 45
    # Open browser
    open http://localhost:{{frontend-port}}

# Build and start only the frontend container and open browser
# Optional parameters: backend-port, frontend-port
build-start-frontend backend-port="3002" frontend-port="8081": check-ports check-docker
    #!/usr/bin/env bash
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up --build frontend &
    # Wait for frontend to start (increased delay to ensure app is fully built)
    sleep 45
    # Open browser
    open http://localhost:{{frontend-port}}

# Build and start only the backend container
# Optional parameters: backend-port, frontend-port
build-start-backend backend-port="3002" frontend-port="8081": check-ports check-docker
    BACKEND_PORT={{backend-port}} FRONTEND_PORT={{frontend-port}} docker-compose up --build backend

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
