# Start from an official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Install OpenSSL - required by Prisma's query engine 
RUN apk add --no-cache openssl

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies 
RUN npm install 

# Copy the rest of the application code 
COPY . .

# Generate Prisma client inside the container 
RUN npx prisma generate

# Expose the port the app runs on
# tells Docker this container listens on this port 
EXPOSE 3000

# The command that runs when the container starts 
CMD ["node", "src/server.js"]