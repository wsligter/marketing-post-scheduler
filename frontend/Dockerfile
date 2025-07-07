FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install && \
    npm install react-datepicker@4.11.0 --save

# Copy the rest of the application
COPY . .

EXPOSE 8080

CMD ["npm", "start"]
