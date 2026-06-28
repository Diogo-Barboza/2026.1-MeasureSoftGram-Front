FROM node:20-alpine

# Set environment
ENV NODE_ENV=development
ENV PORT=3000

# Install dependencies needed for node-gyp and others if necessary
RUN apk add --no-cache libc6-compat

# build-args inlined no bundle (build-time). O default e o ambiente de
# desenvolvimento; o valor de cada ambiente vem via --build-arg no CI.
ARG SERVICE_URL=http://localhost:8080/api
ARG LOGIN_REDIRECT_URL
ARG GITHUB_CLIENT_ID
ENV SERVICE_URL=$SERVICE_URL
ENV LOGIN_REDIRECT_URL=$LOGIN_REDIRECT_URL
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /usr/src

# Copy package management files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "dev"]
