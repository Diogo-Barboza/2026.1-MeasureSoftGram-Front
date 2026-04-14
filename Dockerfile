FROM node:20-alpine

# Set environment
ENV NODE_ENV=development
ENV PORT=3000

# Install dependencies needed for node-gyp and others if necessary
RUN apk add --no-cache libc6-compat

# Enable corepack for pnpm support
RUN corepack enable pnpm

WORKDIR /usr/src

# Copy package management files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "dev"]
