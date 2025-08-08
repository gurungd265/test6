# Use Node.js 20
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean npm cache and force install
RUN npm cache clean --force && npm install --omit=optional

# Rebuild to ensure compatibility
RUN npm rebuild

# Copy app code
COPY . .

# Force Vite to use JS version of Rollup by setting env var
ENV ROLLUP_WASM=true

# Build
RUN npm run build

# Install serve
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
