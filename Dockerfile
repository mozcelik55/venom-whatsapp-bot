FROM node:18-slim

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create working dir
WORKDIR /app

# Copy project files
COPY . .

# Install Node modules
RUN npm install

# 👇 This tells Puppeteer/Venom to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 👇 Optional: Prevent Puppeteer from downloading its own Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set Render port
ENV PORT=10000
EXPOSE 10000

CMD ["node", "index.js"]
