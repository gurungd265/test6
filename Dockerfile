# Use Node.js 20 base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy only the package.json first
COPY package*.json ./

# Clean install without optional dependencies (avoids native issues)
RUN npm install --no-optional

# Copy rest of the app
COPY . .

# Build the React app
RUN npm run build

# Install serve to serve the build output
RUN npm install -g serve

# Expose the port serve will run on
EXPOSE 3000

# Serve the static build folder
CMD ["serve", "-s", "dist", "-l", "3000"]
