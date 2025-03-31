FROM node:23.10-alpine

WORKDIR /app

# Copy package files and (clean) install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app will run on
EXPOSE 5173

# Command to run the application
CMD ["npm", "run", "dev", "--", "--host"]

