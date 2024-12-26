# Use a Node.js base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire application
COPY . .

# Expose the port the app runs on
EXPOSE 9000

# Command to run the application
CMD ["npm", "start"]
