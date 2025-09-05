# Docker Setup for Todo React Application

This document explains how to run the Todo React application using Docker containers.

## Architecture

The application consists of three services:
- **Frontend**: React + TypeScript + Vite (served by Nginx on port 3000)
- **Backend**: FastAPI + Python (running on port 8000)
- **Database**: PostgreSQL 17 (running on port 5432)

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB of free RAM
- Ports 3000, 8000, and 5432 available

### 1. Environment Setup
```bash
# Copy the example environment file
cp docker.env.example .env

# Edit .env file with your preferred settings (optional)
# The default values will work for development
```

### 2. Build and Run
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Individual Service Management

### Frontend Only
```bash
cd frontend
docker build -t todo-frontend .
docker run -p 3000:80 todo-frontend
```

### Backend Only
```bash
cd cf-backend
docker build -t todo-backend .
docker run -p 8000:8000 --env-file ../docker.env.example todo-backend
```

## Development vs Production

### Development
The current setup is optimized for development with:
- Volume mounts for live reloading
- Development environment variables
- Debug logging enabled

### Production Recommendations
For production deployment, consider:

1. **Security**: Change default passwords and JWT secrets
2. **SSL**: Add SSL certificates and configure HTTPS
3. **Performance**: Use production builds and optimize images
4. **Monitoring**: Add health checks and logging
5. **Backup**: Configure database backups

Example production environment:
```bash
# Create production .env
DB_PASSWORD=secure_random_password
JWT_SECRET=very_long_random_jwt_secret_key_change_this
```

## Database Management

### Initialize Database
The database will be automatically initialized with the schema when first started.

### Access Database
```bash
# Connect to running PostgreSQL container
docker-compose exec postgres psql -U todo_user -d slack_todo_db

# Or from host machine
psql -h localhost -U todo_user -d slack_todo_db
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U todo_user slack_todo_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U todo_user slack_todo_db < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml if needed
2. **Database connection issues**: Ensure PostgreSQL is fully started before backend
3. **Frontend API calls failing**: Check backend health and CORS settings

### Useful Commands
```bash
# View logs
docker-compose logs -f [service_name]

# Restart services
docker-compose restart

# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: This deletes data)
docker-compose down -v

# Rebuild specific service
docker-compose up --build [service_name]

# Access container shell
docker-compose exec [service_name] sh
```

### Health Checks
```bash
# Check all services
docker-compose ps

# Backend health
curl http://localhost:8000/healthz

# Database connection
docker-compose exec postgres pg_isready -U todo_user
```

## File Structure
```
todo-react/
├── docker-compose.yml          # Main orchestration file
├── docker.env.example          # Environment variables template
├── frontend/
│   ├── Dockerfile              # Frontend container definition
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore           # Frontend build exclusions
├── cf-backend/
│   ├── Dockerfile              # Backend container definition
│   └── .dockerignore           # Backend build exclusions
└── DOCKER.md                   # This documentation
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USER` | todo_user | PostgreSQL username |
| `DB_PASSWORD` | todo_password | PostgreSQL password |
| `DB_HOST` | postgres | Database host (service name) |
| `DB_PORT` | 5432 | Database port |
| `DB_NAME` | slack_todo_db | Database name |
| `JWT_SECRET` | (example key) | JWT signing secret |
| `ALGORITHM` | HS256 | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 30 | Token expiration time |

## Support

For issues related to:
- **Docker setup**: Check this documentation and Docker logs
- **Application bugs**: Refer to the main README.md
- **Database issues**: Check PostgreSQL documentation
