#!/bin/bash

# Enterprise Search Application Management Script
# This script manages both the Python API backend and React frontend

set -e  # Exit on any error

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
    
    print_warning "Elasticsearch is not running. Please start Elasticsearch manually:"
    print_warning "  brew services start elasticsearch"
    print_warning "  or"
    print_warning "  docker run -d --name elasticsearch -p 9200:9200 -e \"discovery.type=single-node\" docker.elastic.co/elasticsearch/elasticsearch:8.15.0"
    return 1
}

# Function to setup Python environment and install dependencies
setup_python_env() {
    print_status "Setting up Python environment..."
    
    cd "$API_DIR"
    
    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv .venv
    fi
    
    # Activate virtual environment and upgrade pip
    source .venv/bin/activate
    
    # Install/upgrade dependencies
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements-dev.txt
    
    cd "$PROJECT_ROOT"
}

# Function to start the Python API backend
start_backend() {
    print_status "Starting Python API backend..."
    
    if is_running "$PID_DIR/backend.pid"; then
        print_warning "Backend is already running (PID: $(cat $PID_DIR/backend.pid))"
        return 0
    fi
    
    cd "$API_DIR"
    source .venv/bin/activate
    
    if [ "$DEBUG_MODE" = "true" ]; then
        print_debug "Starting backend in debug mode with auto-reload..."
        nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug > "$LOG_DIR/backend.log" 2>&1 &
    else
        nohup uvicorn main:app --host 0.0.0.0 --port 8000 > "$LOG_DIR/backend.log" 2>&1 &
    fi
    
    echo $! > "$PID_DIR/backend.pid"
    cd "$PROJECT_ROOT"
    
    # Wait for backend to be ready
    wait_for_service "http://localhost:8000/health" "Python API Backend"
}

# Function to start the React frontend
start_frontend() {
    print_status "Starting React frontend..."
    
    if is_running "$PID_DIR/frontend.pid"; then
        print_warning "Frontend is already running (PID: $(cat $PID_DIR/frontend.pid))"
        return 0
    fi
    
    cd "$FRONTEND_DIR"
    
    # Install/update dependencies
    print_status "Installing/updating Node.js dependencies..."
    npm install
    
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
    
    cd "$PYTHON_DIR"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d ".venv" ]; then
        print_status "Creating Python virtual environment for data setup..."
        python3 -m venv .venv
        source .venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
    else
        source .venv/bin/activate
    fi
    
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
    *)
        echo "Enterprise Search Application Manager"
        echo
        echo "Usage: $0 {start|stop|restart|status|logs|dev|setup}"
        echo
        echo "Commands:"
        echo "  start       - Start all services (backend + frontend)"
        echo "  stop        - Stop all services"
        echo "  restart     - Restart all services"
        echo "  status      - Show status of all services"
        echo "  logs        - Show logs (usage: logs [backend|frontend])"
        echo "  dev         - Start in development mode with auto-reload"
        echo "  setup       - Setup Python environment and Elasticsearch data"
        echo
        echo "Examples:"
        echo "  $0 dev                    # Start in development mode"
        echo "  $0 start                  # Start all services"
        echo "  $0 logs backend          # Show backend logs"
        echo "  $0 status                # Show service status"
        echo
        exit 1
        ;;
esac
