# Enterprise Search

Unified search platform with React frontend, FastAPI backend, and Elasticsearch integration.

## Features
- Employee search with hierarchy
- Full-text search
- Hot-reload development workflow
- Unified management scripts

## Getting Started

### Prerequisites
- Node.js
- Python 3.9+
- Elasticsearch 8.x

### Setup
1. Install dependencies:
   - `npm install`
   - `cd api && pip install -r requirements.txt`
2. Start Elasticsearch
3. Run the app:
   - `./manage.sh start` (production)
   - `./manage.sh dev` (development)

## Scripts
- `manage.sh`: Unified management (start/stop/restart/dev)

## License
MIT
