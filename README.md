# Marketing Tool Application

A full-stack marketing campaign management application built with Node.js, React, MongoDB, and Docker.

## Project Structure

```
marketing_tool/
├── backend/           # Express.js API
├── frontend/          # React frontend
├── database/          # MongoDB data (volume mount)
├── docker-compose.yml # Docker configuration
└── README.md          # This file
```

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development without Docker)

## Getting Started

### Running with Docker

1. Clone this repository
2. Navigate to the project directory
3. Start the application:

```bash
docker-compose up
```

This will:
- Build and start the backend service on port 3000
- Build and start the frontend service on port 8080
- Start a MongoDB instance on port 27017

### Accessing the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- MongoDB: mongodb://localhost:27017/marketingapp

## Development

### Backend

The backend is an Express.js application with MongoDB for data storage.

```bash
cd backend
npm install
npm run dev
```

### Frontend

The frontend is a React application created with Create React App.

```bash
cd frontend
npm install
npm start
```

## Features

- Create and manage marketing campaigns
- Track campaign status
- Store campaign data in MongoDB

## License

MIT
