FROM node:20-alpine AS base

# Create and move into the working directory
WORKDIR /deepoints/api

# Copy dependency files first (best practice for caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of your application source code
COPY . .

ENV DIRECT_URL="mock"
ENV DATABASE_URL="mock"

# Generate Prisma Client (Crucial step before building!)
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port your app listens on
EXPOSE 3000

# Start the application (Using JSON array syntax is correct here)
CMD ["npm", "run", "start"]