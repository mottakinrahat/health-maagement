FROM node:20-alpine

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency definitions and Prisma schema for efficient caching
COPY package*.json ./
COPY prisma ./prisma/

# Install node dependencies inside container
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port (default 3000)
EXPOSE 3000

# Start development server with hot-reloading
CMD ["npm", "run", "dev"]
