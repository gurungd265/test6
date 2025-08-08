# Use Node.js 20 for compatibility with React 19 and react-router-dom 7
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Use a lightweight web server to serve the static files
# You can use nginx, but vite preview works too (for simplicity)
# If you want to use nginx, see alternate Dockerfile below

# Install serve to serve static files
RUN npm install -g serve

# Expose the port serve uses
EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "dist", "-l", "3000"]
