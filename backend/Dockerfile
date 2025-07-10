FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Use ARG to accept the port value during build time
ARG PORT=3002
# Set ENV variable for runtime
ENV PORT=$PORT
# Expose the port dynamically
EXPOSE $PORT

CMD ["npm", "start"]
