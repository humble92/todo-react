# frontend/Dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Set environment variable for nginx reverse proxy
ENV VITE_API_BASE_URL=/api

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template (instead of nginx.conf)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Set default backend URL (for docker-compose)
ENV BACKEND_URL=http://backend:8000

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]