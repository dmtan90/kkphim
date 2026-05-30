# Use official Node.js light image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --prod; \
    elif [ -f package-lock.json ]; then npm ci --only=production; \
    else npm install --prod; fi

# Copy application source
COPY index.js ./

# Expose port (Cloud Run will override via PORT env var anyway)
EXPOSE 3005

# Start command
CMD ["node", "index.js"]
