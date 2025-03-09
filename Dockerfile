# Use Node.js official image as base
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose Metro Bundler default port
EXPOSE 8081

# Start the Metro Bundler when the container runs
CMD ["npm", "start"]