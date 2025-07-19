FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install && \
    npm install react-datepicker@4.11.0 react-calendar@6.0.0 --save

# Copy the rest of the application
COPY . .

# Set environment variables for development hot reloading
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=true

EXPOSE 8081

CMD ["npm", "start"]
