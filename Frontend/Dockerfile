# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies
# Using npm install fallback in case npm ci fails or isn't appropriate
RUN npm ci || npm install

# Copy all source files and build the React app
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy the build output from the builder stage over to nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config can be added here if necessary, but default works for a simple Vite SPA usually.
# If you have client-side routing, you might need a custom nginx.conf to redirect to index.html.
# e.g., COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose default HTTP port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
