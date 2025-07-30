#!/bin/bash

# Enterprise Search Application Management Script
# This script manages both the Python API backend and React frontend using Conda

set -e  # Exit on any error

# Python Configuration - Prevent bytecode generation
export PYTHONDONTWRITEBYTECODE=1
export PYTHONPYCACHEPREFIX=""

# Conda Environment Configuration
CONDA_ENV_NAME="enterprise-search"

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$PROJECT_ROOT/api"
PYTHON_DIR="$PROJECT_ROOT/python"
FRONTEND_DIR="$PROJECT_ROOT"
LOG_DIR="$PROJECT_ROOT/logs"
PID_DIR="$PROJECT_ROOT/pids"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create necessary directories
mkdir -p "$LOG_DIR" "$PID_DIR"

# Function to activate conda environment
activate_conda_env() {
    if command -v conda >/dev/null 2>&1; then
        print_status "Activating conda environment: $CONDA_ENV_NAME"
        source "$(conda info --base)/etc/profile.d/conda.sh"
        conda activate "$CONDA_ENV_NAME" 2>/dev/null || {
            print_error "Failed to activate conda environment '$CONDA_ENV_NAME'"
            print_status "Creating conda environment from environment.yml..."
            conda env create -f environment.yml
            conda activate "$CONDA_ENV_NAME"
        }
    else
        print_error "Conda not found. Please install Miniconda or Anaconda."
        exit 1
    fi
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Function to check if a process is running
is_running() {
    local pidfile=$1
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$pidfile"
            return 1
        fi
    fi
    return 1
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_status "$service_name is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to start Elasticsearch
start_elasticsearch() {
    print_status "Checking Elasticsearch..."
    if curl -s -f "http://localhost:9200" > /dev/null 2>&1; then
        print_status "Elasticsearch is already running"
        return 0
    fi
    
    # Try to start with Docker Compose first
    if command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1; then
        print_status "Starting Elasticsearch 8.18.0 using Docker Compose..."
        
        # Try docker-compose first, then docker compose
        if command -v docker-compose >/dev/null 2>&1; then
            docker-compose up -d elasticsearch 2>/dev/null || {
                print_warning "docker-compose failed, trying docker compose..."
                docker compose up -d elasticsearch 2>/dev/null || {
                    print_error "Both docker-compose and docker compose failed"
                }
            }
        else
            docker compose up -d elasticsearch 2>/dev/null || {
                print_error "docker compose failed"
            }
        fi
        
        # Wait for Elasticsearch to be ready
        print_status "Waiting for Elasticsearch to be ready..."
        local attempts=30
        while [ $attempts -gt 0 ]; do
            if curl -s -f "http://localhost:9200" > /dev/null 2>&1; then
                print_status "Elasticsearch 8.18.0 is ready!"
                return 0
            fi
            echo -n "."
            sleep 2
            attempts=$((attempts - 1))
        done
        print_error "Elasticsearch failed to start with Docker"
    fi
    
    print_warning "Elasticsearch is not running. Please start Elasticsearch manually:"
    print_warning "  docker-compose up -d elasticsearch    # Using Docker Compose (recommended)"
    print_warning "  brew services start elasticsearch     # Using Homebrew"
    print_warning "  or"
    print_warning "  docker run -d --name elasticsearch -p 9200:9200 -e \"discovery.type=single-node\" -e \"xpack.security.enabled=false\" docker.elastic.co/elasticsearch/elasticsearch:8.18.0"
    return 1
}

# Function to check if Python dependencies need to be installed
check_python_deps() {
    # Check if conda environment exists
    if ! conda env list | grep -q "^$CONDA_ENV_NAME "; then
        return 1  # Need to create environment
    fi
    
    # Activate conda environment and check dependencies
    source "$(conda info --base)/etc/profile.d/conda.sh"
    conda activate "$CONDA_ENV_NAME"
    
    # Check if required packages are installed
    if ! python -c "import fastapi, uvicorn" 2>/dev/null; then
        return 1  # Need to install
    fi
    
    return 0  # Dependencies are up to date
}

# Function to check if Node.js dependencies need to be installed
check_node_deps() {
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        return 1  # Need to install
    fi
    
    # Check if package.json is newer than node_modules
    if [ "package.json" -nt "node_modules" ]; then
        return 1  # Need to install
    fi
    
    return 0  # Dependencies are up to date
}

# Function to setup Python environment and install dependencies
setup_python_env() {
    print_status "Setting up Python environment with Conda..."
    
    # Activate conda environment (create if needed)
    activate_conda_env
    
    # Install any additional dependencies if needed
    if ! check_python_deps; then
        print_status "Installing additional Python dependencies..."
        pip install --upgrade pip
        if [ -f "$API_DIR/requirements-dev.txt" ]; then
            pip install -r "$API_DIR/requirements-dev.txt"
        fi
    else
        print_status "Python dependencies are up to date"
    fi
}

# Function to start the Python API backend
start_backend() {
    print_status "Starting Python API backend..."
    
    if is_running "$PID_DIR/backend.pid"; then
        print_warning "Backend is already running (PID: $(cat $PID_DIR/backend.pid))"
        return 0
    fi
    
    # Activate conda environment
    activate_conda_env
    
    cd "$API_DIR"
    
    if [ "$DEBUG_MODE" = "true" ]; then
        print_debug "Starting backend in debug mode with auto-reload..."
        nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug > "$LOG_DIR/backend.log" 2>&1 &
    else
        nohup uvicorn main:app --host 0.0.0.0 --port 8000 > "$LOG_DIR/backend.log" 2>&1 &
    fi
    
    echo $! > "$PID_DIR/backend.pid"
    cd "$PROJECT_ROOT"
    
    # Wait for backend to be ready
    wait_for_service "http://localhost:8000/api/v1/health" "Python API Backend"
}

# Function to start the React frontend
start_frontend() {
    print_status "Starting React frontend..."
    
    if is_running "$PID_DIR/frontend.pid"; then
        print_warning "Frontend is already running (PID: $(cat $PID_DIR/frontend.pid))"
        return 0
    fi
    
    cd "$FRONTEND_DIR"
    
    # Only install dependencies if needed
    if ! check_node_deps; then
        print_status "Installing/updating Node.js dependencies..."
        npm install --legacy-peer-deps
    else
        print_status "Node.js dependencies are up to date, skipping installation"
    fi
    
    # Clear any cached builds
    rm -rf node_modules/.cache
    
    if [ "$DEBUG_MODE" = "true" ]; then
        print_debug "Starting frontend in debug mode with auto-reload..."
        export BROWSER=none  # Prevent browser from opening automatically
        export FAST_REFRESH=true  # Enable fast refresh for better development experience
        nohup npm start > "$LOG_DIR/frontend.log" 2>&1 &
    else
        nohup npm start > "$LOG_DIR/frontend.log" 2>&1 &
    fi
    
    echo $! > "$PID_DIR/frontend.pid"
    
    # Wait for frontend to be ready
    wait_for_service "http://localhost:3000" "React Frontend"
}

# Function to start Elasticsearch data setup
setup_elasticsearch_data() {
    print_status "Setting up Elasticsearch data..."
    
    # Activate conda environment
    activate_conda_env
    
    cd "$PYTHON_DIR"
    
    # Run Elasticsearch setup
    print_status "Setting up Elasticsearch indices and data..."
    python setup_elastic.py
    python gen_test_data.py
    
    cd "$PROJECT_ROOT"
}

# Function to stop services
stop_service() {
    local pidfile=$1
    local service_name=$2
    
    if is_running "$pidfile"; then
        local pid=$(cat "$pidfile")
        print_status "Stopping $service_name (PID: $pid)..."
        kill "$pid"
        
        # Wait for process to stop
        local attempts=10
        while [ $attempts -gt 0 ]; do
            if ! ps -p "$pid" > /dev/null 2>&1; then
                break
            fi
            sleep 1
            attempts=$((attempts - 1))
        done
        
        # Force kill if still running
        if ps -p "$pid" > /dev/null 2>&1; then
            print_warning "Force killing $service_name..."
            kill -9 "$pid"
        fi
        
        rm -f "$pidfile"
        print_status "$service_name stopped"
    else
        print_warning "$service_name is not running"
    fi
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    stop_service "$PID_DIR/frontend.pid" "React Frontend"
    stop_service "$PID_DIR/backend.pid" "Python API Backend"
}

# Function to show service status
show_status() {
    echo
    print_status "=== Service Status ==="
    
    # Check Elasticsearch
    if curl -s -f "http://localhost:9200" > /dev/null 2>&1; then
        echo -e "Elasticsearch:    ${GREEN}Running${NC} (http://localhost:9200)"
    else
        echo -e "Elasticsearch:    ${RED}Not Running${NC}"
    fi
    
    # Check Backend
    if is_running "$PID_DIR/backend.pid"; then
        echo -e "Python API:       ${GREEN}Running${NC} (PID: $(cat $PID_DIR/backend.pid), http://localhost:8000)"
    else
        echo -e "Python API:       ${RED}Not Running${NC}"
    fi
    
    # Check Frontend
    if is_running "$PID_DIR/frontend.pid"; then
        echo -e "React Frontend:   ${GREEN}Running${NC} (PID: $(cat $PID_DIR/frontend.pid), http://localhost:3000)"
    else
        echo -e "React Frontend:   ${RED}Not Running${NC}"
    fi
    echo
}

# Function to show logs
show_logs() {
    local service=$1
    case $service in
        "backend"|"api")
            if [ -f "$LOG_DIR/backend.log" ]; then
                tail -f "$LOG_DIR/backend.log"
            else
                print_error "Backend log file not found"
            fi
            ;;
        "frontend"|"react")
            if [ -f "$LOG_DIR/frontend.log" ]; then
                tail -f "$LOG_DIR/frontend.log"
            else
                print_error "Frontend log file not found"
            fi
            ;;
        *)
            print_error "Unknown service: $service"
            print_status "Available services: backend, frontend"
            ;;
    esac
}

# Function to run development mode with auto-reload
dev_mode() {
    export DEBUG_MODE="true"
    print_status "Starting application in DEVELOPMENT mode..."
    print_debug "Auto-reload enabled for both frontend and backend"
    
    # Start all services
    start_elasticsearch || exit 1
    setup_python_env
    start_backend
    start_frontend
    setup_elasticsearch_data
    
    show_status
    
    print_status "Development mode started! Services will auto-reload on changes."
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
    print_status "API Docs: http://localhost:8000/docs"
    print_status ""
    print_status "Use 'Ctrl+C' to stop all services, or run './manage.sh stop' in another terminal"
    
    # Keep script running and handle Ctrl+C
    trap 'print_status "Shutting down..."; stop_all; exit 0' INT
    while true; do
        sleep 1
    done
}

# Main script logic
case "${1:-}" in
    "start")
        start_elasticsearch || exit 1
        setup_python_env
        start_backend
        start_frontend
        setup_elasticsearch_data
        show_status
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        stop_all
        sleep 2
        start_elasticsearch || exit 1
        setup_python_env
        start_backend
        start_frontend
        show_status
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "${2:-}"
        ;;
    "dev"|"development")
        dev_mode
        ;;
    "setup")
        start_elasticsearch || exit 1
        setup_python_env
        setup_elasticsearch_data
        print_status "Setup completed successfully!"
        ;;
    "install")
        case "${2:-}" in
            "clean")
                print_status "=== CLEAN INSTALLATION ==="
                print_warning "This will remove and recreate the conda environment and node_modules"
                read -p "Are you sure you want to continue? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    # Stop all services first
                    stop_all
                    
                    # Remove conda environment
                    print_status "Removing existing conda environment: $CONDA_ENV_NAME"
                    conda env remove -n "$CONDA_ENV_NAME" -y 2>/dev/null || print_warning "Environment didn't exist"
                    
                    # Remove node_modules and package-lock
                    print_status "Cleaning Node.js artifacts..."
                    cd "$FRONTEND_DIR"
                    rm -rf node_modules package-lock.json npm-debug.log* .npm
                    
                    # Remove Python cache files
                    print_status "Cleaning Python cache files..."
                    find "$PROJECT_ROOT" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
                    find "$PROJECT_ROOT" -type f -name "*.pyc" -delete 2>/dev/null || true
                    find "$PROJECT_ROOT" -type f -name "*.pyo" -delete 2>/dev/null || true
                    
                    # Clean logs and PIDs
                    print_status "Cleaning logs and PID files..."
                    rm -rf "$LOG_DIR"/* "$PID_DIR"/*
                    
                    # Fresh installation
                    print_status "Starting fresh installation..."
                    conda env create -f environment.yml
                    activate_conda_env
                    
                    # Install Python dependencies
                    print_status "Installing Python dependencies..."
                    cd "$API_DIR"
                    pip install --upgrade pip
                    if [ -f "requirements-dev.txt" ]; then
                        pip install -r requirements-dev.txt
                    fi
                    
                    # Install Node.js dependencies
                    print_status "Installing Node.js dependencies..."
                    cd "$FRONTEND_DIR"
                    npm install --legacy-peer-deps
                    
                    print_status "✅ Clean installation completed successfully!"
                    print_status "Run './manage.sh start' to start the application"
                else
                    print_status "Clean installation cancelled"
                fi
                ;;
            "deps"|"dependencies"|"")
                print_status "=== DEPENDENCY INSTALLATION/UPDATE ==="
                print_status "Installing/updating all dependencies..."
                
                # Setup Python environment and dependencies
                activate_conda_env
                cd "$API_DIR"
                pip install --upgrade pip
                if [ -f "requirements-dev.txt" ]; then
                    pip install -r requirements-dev.txt
                fi
                
                # Install Node.js dependencies
                cd "$FRONTEND_DIR"
                print_status "Installing/updating Node.js dependencies..."
                npm install --legacy-peer-deps
                
                print_status "✅ Dependencies installation completed!"
                ;;
            "elasticsearch"|"es")
                print_status "=== ELASTICSEARCH SETUP ==="
                start_elasticsearch || {
                    print_error "Failed to start Elasticsearch"
                    exit 1
                }
                setup_elasticsearch_data
                print_status "✅ Elasticsearch setup completed!"
                ;;
            "python")
                print_status "=== PYTHON ENVIRONMENT SETUP ==="
                activate_conda_env
                cd "$API_DIR"
                pip install --upgrade pip
                if [ -f "requirements-dev.txt" ]; then
                    pip install -r requirements-dev.txt
                fi
                print_status "✅ Python environment setup completed!"
                ;;
            "node"|"npm")
                print_status "=== NODE.JS DEPENDENCIES SETUP ==="
                cd "$FRONTEND_DIR"
                npm install --legacy-peer-deps
                print_status "✅ Node.js dependencies setup completed!"
                ;;
            "full")
                print_status "=== FULL INSTALLATION ==="
                print_status "Installing everything from scratch (keeping existing environments)..."
                
                # Setup Python environment
                activate_conda_env
                cd "$API_DIR"
                pip install --upgrade pip
                if [ -f "requirements-dev.txt" ]; then
                    pip install -r requirements-dev.txt
                fi
                
                # Setup Node.js dependencies
                cd "$FRONTEND_DIR"
                npm install --legacy-peer-deps
                
                # Setup Elasticsearch
                start_elasticsearch || {
                    print_error "Failed to start Elasticsearch"
                    exit 1
                }
                setup_elasticsearch_data
                
                print_status "✅ Full installation completed!"
                print_status "Run './manage.sh start' to start the application"
                ;;
            *)
                echo "Usage: $0 install {clean|deps|elasticsearch|python|node|full}"
                echo
                echo "Install Options:"
                echo "  clean         - Clean installation (removes environments and reinstalls everything)"
                echo "  deps          - Install/update all dependencies (default)"
                echo "  elasticsearch - Setup Elasticsearch data only"
                echo "  python        - Setup Python environment and dependencies only"
                echo "  node          - Install Node.js dependencies only"
                echo "  full          - Full installation (dependencies + Elasticsearch setup)"
                echo
                echo "Examples:"
                echo "  $0 install clean      # Complete clean installation"
                echo "  $0 install deps       # Update all dependencies"
                echo "  $0 install python     # Setup Python environment only"
                echo "  $0 install full       # Full installation"
                exit 1
                ;;
        esac
        ;;
    "install-deps")
        print_status "Force installing all dependencies..."
        activate_conda_env
        cd "$API_DIR"
        pip install --upgrade pip
        if [ -f "requirements-dev.txt" ]; then
            pip install -r requirements-dev.txt
        fi
        cd "$FRONTEND_DIR"
        npm install --legacy-peer-deps
        print_status "Dependencies installation completed!"
        ;;
    "elasticsearch")
        case "${2:-}" in
            "start")
                print_status "Starting Elasticsearch 8.18.0..."
                if command -v docker-compose >/dev/null 2>&1; then
                    docker-compose up -d elasticsearch 2>/dev/null || {
                        print_error "Failed to start with docker-compose, trying docker compose..."
                        docker compose up -d elasticsearch 2>/dev/null || {
                            print_error "Failed to start Elasticsearch with Docker"
                            exit 1
                        }
                    }
                else
                    docker compose up -d elasticsearch 2>/dev/null || {
                        print_error "Failed to start Elasticsearch with Docker"
                        exit 1
                    }
                fi
                
                # Wait for Elasticsearch to be ready
                print_status "Waiting for Elasticsearch to start..."
                local attempts=30
                while [ $attempts -gt 0 ]; do
                    if curl -s -f "http://localhost:9200" > /dev/null 2>&1; then
                        print_status "Elasticsearch 8.18.0 is ready!"
                        return 0
                    fi
                    echo -n "."
                    sleep 2
                    attempts=$((attempts - 1))
                done
                print_error "Elasticsearch failed to start within 60 seconds"
                ;;
            "stop")
                print_status "Stopping Elasticsearch..."
                if command -v docker-compose >/dev/null 2>&1; then
                    docker-compose stop elasticsearch 2>/dev/null
                else
                    docker compose stop elasticsearch 2>/dev/null
                fi
                ;;
            "restart")
                print_status "Restarting Elasticsearch..."
                if command -v docker-compose >/dev/null 2>&1; then
                    docker-compose restart elasticsearch 2>/dev/null
                else
                    docker compose restart elasticsearch 2>/dev/null
                fi
                ;;
            "logs")
                print_status "Showing Elasticsearch logs..."
                if command -v docker-compose >/dev/null 2>&1; then
                    docker-compose logs -f elasticsearch
                else
                    docker compose logs -f elasticsearch
                fi
                ;;
            *)
                echo "Usage: $0 elasticsearch {start|stop|restart|logs}"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "Enterprise Search Application Manager"
        echo
        echo "Usage: $0 {start|stop|restart|status|logs|dev|setup|install|install-deps|elasticsearch}"
        echo
        echo "Commands:"
        echo "  start       - Start all services (backend + frontend)"
        echo "  stop        - Stop all services"
        echo "  restart     - Restart all services"
        echo "  status      - Show status of all services"
        echo "  logs        - Show logs (usage: logs [backend|frontend])"
        echo "  dev         - Start in development mode with auto-reload"
        echo "  setup       - Setup Python environment and Elasticsearch data"
        echo "  install     - Install/reinstall components (clean|deps|python|node|elasticsearch|full)"
        echo "  install-deps - Force install/update all dependencies (legacy)"
        echo "  elasticsearch - Manage Elasticsearch (start|stop|restart|logs)"
        echo
        echo "Examples:"
        echo "  $0 dev                    # Start in development mode"
        echo "  $0 start                  # Start all services"
        echo "  $0 install clean          # Clean installation (removes everything)"
        echo "  $0 install deps           # Update all dependencies"
        echo "  $0 install python         # Setup Python environment only"
        echo "  $0 install full           # Full installation with Elasticsearch"
        echo "  $0 logs backend          # Show backend logs"
        echo "  $0 status                # Show service status"
        echo "  $0 elasticsearch start   # Start only Elasticsearch"
        echo "  $0 elasticsearch logs    # Show Elasticsearch logs"
        echo
        exit 1
        ;;
esac
