# Marketing Post Scheduler

A full-stack application for planning and scheduling marketing campaigns across social media platforms. Built with Node.js, React, MongoDB, and Docker.

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Just](https://github.com/casey/just#installation) (optional, for simplified commands)

### Run the Application

**With Docker (recommended):**

```bash
# Using Docker directly
docker-compose up

# OR using Just (if installed)
just start
```

**For Development (without Docker):**

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### Access the Application

- **Frontend:** [http://localhost:8081](http://localhost:8081)
- **Backend API:** [http://localhost:3002](http://localhost:3002)
- **MongoDB:** mongodb://localhost:27017/marketingapp

## Features

- Create and manage marketing campaigns
- Schedule posts for specific dates and times
- Upload and manage images for posts via Cloudinary
- Preview thumbnails for uploaded images
- Track post status (draft, scheduled, published)
- Filter posts by campaign and status
- Calendar view for scheduled posts
- Delete images from Cloudinary when posts are updated or deleted

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary
- **Containerization**: Docker

## Project Structure

```text
marketing_tool/
├── backend/           # Express.js API
│   ├── routes/        # API routes
│   ├── models/        # Mongoose models
│   ├── utils/         # Utility functions
│   ├── config/        # Configuration files
│   └── uploads/       # Temporary storage for uploads
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
├── database/          # MongoDB data (volume mount)
├── docker-compose.yml # Docker configuration
├── justfile           # Task runner for common commands
└── README.md          # Project documentation
```

## Environment Variables

### Backend (.env)

```env
# MongoDB Atlas Configuration
MONGO_USERNAME=your_username
MONGO_PASSWORD=your_password
MONGO_CLUSTER=your_cluster.mongodb.net
MONGO_APP_NAME=your_app_name

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=3002
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3002
```

## Database Setup

The application uses MongoDB Atlas as its database. It connects to a database named `marketing-tool-tables` with two collections:

1. **campaigns** - Stores marketing campaign information
2. **posts** - Stores post content, scheduled dates, and references to campaigns

When a campaign is deleted, all posts associated with that campaign will have their campaign field set to null, ensuring no orphaned references.

## Cloudinary Integration

This application uses Cloudinary for image storage and management. The integration includes:

1. **Image Upload**: Images are uploaded to Cloudinary when creating or editing posts
2. **Image Preview**: Thumbnails are generated client-side for preview before upload
3. **Image Deletion**: Images are automatically deleted from Cloudinary when:
   - A post with an image is deleted
   - An image is removed from a post during editing
   - A new image replaces an existing one

The backend handles all Cloudinary API interactions through utility functions in `backend/utils/cloudinary-actions.js`.

## Command Reference

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Just Commands

If you have [Just](https://github.com/casey/just#installation) installed:

```bash
# List all available commands
just

# Common commands

just start              # Start all containers
just start-detached     # Start in background
just stop               # Stop all containers
just logs               # View all logs
just logs-service backend  # View specific service logs
just build              # Build containers without starting
just build-start        # Build and start containers
just build-start-detached  # Build and start in background
just status             # Show container status
just bump-patch         # Increment patch version (1.0.0 -> 1.0.1)
just bump-minor         # Increment minor version (1.0.0 -> 1.1.0)
just bump-major         # Increment major version (1.0.0 -> 2.0.0)
just version-bump patch # Alternative way to bump version

```

## Troubleshooting

### Port Conflicts

The application uses the following ports:

- Backend: 3002
- Frontend: 8081
- MongoDB: 27017

If you encounter port conflicts, the `just` commands will automatically attempt to kill processes using these ports before starting the containers.

### Image Upload Issues

If images aren't uploading properly:

1. Check your Cloudinary credentials in the backend `.env` file
2. Ensure the backend server has write permissions to the temporary uploads directory
3. Verify network connectivity to Cloudinary's API

### Database Connection Issues

If you're having trouble connecting to MongoDB Atlas:

1. Verify your MongoDB Atlas credentials in the backend `.env` file
2. Check that your IP address is whitelisted in the MongoDB Atlas dashboard
3. Make sure the `NODE_ENV` is set to `development` in docker-compose.yml
4. Ensure you're using the standard SRV connection string format in database.js
5. Run the test connection script: `node backend/utils/test-mongodb-connection.js`

## Development Workflow

1. Make changes to the code
2. Build the containers: `just build`
3. Start the application: `just start` or `just start-detached`
4. View logs if needed: `just logs-follow`
5. Stop the application when done: `just stop`

## License

MIT
