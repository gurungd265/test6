# Use official Node.js 20 image
FROM node:20

# Set working directory
WORKDIR /app

# Copy only package files first for cache optimization
COPY package*.json ./

# Install dependencies WITHOUT optional native ones like rollup-linux-x64-gnu
RUN npm install --no-optional

# Copy the rest of your project
COPY . .

# Build the React app with Vite
RUN npm run build

# Install lightweight web server to serve static files
RUN npm install -g serve

# Expose port for Render
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]
