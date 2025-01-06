# Use Node.js base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies, including dev dependencies like @types/node
RUN npm install

# Ensure that TypeScript is installed globally if needed (optional)
RUN npm install -g typescript

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Build the application
RUN npm run build

# Command to run the application
CMD ["npm", "start"]