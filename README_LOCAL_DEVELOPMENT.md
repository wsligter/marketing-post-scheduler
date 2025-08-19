# Local Development Guide

Complete guide for setting up, running, and testing the Marketing Post Scheduler locally.

## Prerequisites

### Required Software

- **Node.js** (v16 or higher)
- **Docker** and Docker Compose
- **Git**

### Optional Tools

- **[Just](https://github.com/casey/just#installation)** - Task runner for simplified commands
- **MongoDB Compass** - GUI for MongoDB (if using local database)

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd marketing_tool

# Install dependencies (if running without Docker)
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Environment Configuration

Create environment files from examples:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment  
cp frontend/.env.example frontend/.env
```

### 3. Start the Application

**Option A: Docker (Recommended)**

```bash
# Start all services
docker-compose up

# OR with Just
just start
```

**Option B: Manual Setup**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### 4. Access the Application

- **Frontend**: [http://localhost:8081](http://localhost:8081)
- **Backend API**: [http://localhost:3002](http://localhost:3002)
- **Health Check**: [http://localhost:3002/api/health](http://localhost:3002/api/health)

## Environment Variables

### Backend Configuration (.env)

```env
# Database - MongoDB Atlas (Recommended)
MONGO_USERNAME=your_atlas_username
MONGO_PASSWORD=your_atlas_password
MONGO_CLUSTER=your_cluster.mongodb.net
MONGO_APP_NAME=your_app_name

# OR Local MongoDB (Alternative)
# MONGODB_URI=mongodb://localhost:27017/marketingapp

# Image Storage - Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Features (Optional)
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3002
NODE_ENV=development
JWT_SECRET=your_local_jwt_secret_min_32_chars
```

### Frontend Configuration (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3002
```

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose free tier (M0 Sandbox)
3. **Database Access**: Create database user with read/write permissions
4. **Network Access**: Add your IP address (0.0.0.0/0 for development)
5. **Get Connection Details**: Copy cluster address and credentials
6. **Test Connection**:

   ```bash
   cd backend
   node utils/test-mongodb-connection.js
   ```

### Option 2: Local MongoDB

```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Update backend/.env
MONGODB_URI=mongodb://localhost:27017/marketingapp
```

## Cloudinary Integration

### Setup Cloudinary Account

1. **Create Account**: Sign up at [Cloudinary](https://cloudinary.com)
2. **Get Credentials**: Find in Dashboard → Settings → Security
3. **Configure Environment**: Add credentials to `backend/.env`

### Test Image Upload

1. Start the application
2. Create a new post
3. Upload an image
4. Verify image appears in Cloudinary dashboard

## Project Structure

```text
marketing_tool/
├── backend/                 # Node.js Express API
│   ├── config/             # Configuration files
│   │   ├── cloudinary.js   # Cloudinary setup
│   │   └── database.js     # MongoDB connection
│   ├── controllers/        # Route controllers
│   │   └── userController.js
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # Authentication
│   ├── models/             # Mongoose schemas
│   │   ├── Campaign.js     # Campaign model
│   │   ├── Post.js         # Post model
│   │   ├── SystemPrompt.js # AI prompts model
│   │   └── User.js         # User model
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   │   ├── cloudinary-actions.js
│   │   ├── keep-alive.js   # Free tier optimization
│   │   └── test-mongodb-connection.js
│   ├── .env.example        # Environment template
│   ├── package.json        # Dependencies
│   └── server.js           # Entry point
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── .env.example        # Environment template
│   └── package.json        # Dependencies
├── docker-compose.yml      # Docker configuration
├── justfile               # Task automation
└── README.md              # Main documentation
```

## Testing Locally

### 1. Basic Functionality Tests

**User Authentication**:

```bash
# Test user registration
curl -X POST http://localhost:3002/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test user login
curl -X POST http://localhost:3002/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Campaign Management**:

1. Login to the frontend
2. Create a new campaign
3. Verify campaign appears in campaigns list
4. Edit and delete campaigns

**Post Scheduling**:

1. Create a new post with future date
2. Upload an image
3. Assign to campaign
4. Verify post appears in calendar view
5. Test post status updates

### 2. API Testing

**Health Check**:

```bash
curl http://localhost:3002/api/health
```

**Database Connection**:

```bash
cd backend
node utils/test-mongodb-connection.js
```

**API Endpoints**:

- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/users/for-assignment` - List users

### 3. Frontend Testing

**Component Testing**:

1. Navigate through all pages
2. Test responsive design (resize browser)
3. Test mobile navigation (hamburger menu)
4. Verify all forms work correctly

**Calendar Testing**:

1. Navigate between months
2. Click on dates with posts
3. Verify post details display correctly

**AI Features** (if OpenAI configured):

1. Go to "Create New" page
2. Click "Help me write"
3. Select system prompt or enter custom prompt
4. Generate content and verify it works

### 4. Error Handling Tests

**Network Errors**:

1. Stop backend service
2. Try to create a post in frontend
3. Verify error messages display properly
4. Restart backend and verify retry logic works

**Database Errors**:

1. Use invalid MongoDB credentials
2. Verify graceful error handling
3. Check logs for proper error messages

## Development Commands

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose build
```

### Just Commands (if installed)

```bash
# List available commands
just

# Development commands
just start                    # Start all containers
just start-detached          # Start in background
just stop                    # Stop containers
just logs                    # View logs
just build                   # Build containers
just build-start             # Build and start

# Service-specific logs
just logs-service backend
just logs-service frontend

# Version management
just bump-patch              # 1.0.0 → 1.0.1
just bump-minor              # 1.0.0 → 1.1.0
just bump-major              # 1.0.0 → 2.0.0
```

### Manual Commands

```bash
# Backend development
cd backend
npm run dev                  # Start with nodemon
npm test                     # Run tests (if available)

# Frontend development
cd frontend
npm start                    # Start development server
npm run build                # Build for production
npm test                     # Run tests
```

## Troubleshooting

### Port Conflicts

**Problem**: Ports 3002, 8081, or 27017 already in use

**Solutions**:

```bash
# Find processes using ports
lsof -i :3002
lsof -i :8081
lsof -i :27017

# Kill processes (replace PID)
kill -9 <PID>

# OR use Just (automatically handles port conflicts)
just start
```

### Database Connection Issues

**Problem**: Cannot connect to MongoDB

**Solutions**:
1. Verify credentials in `backend/.env`
2. Check MongoDB Atlas IP allowlist
3. Test connection:
   ```bash
   cd backend
   node utils/test-mongodb-connection.js
   ```
4. Check network connectivity

### Image Upload Problems

**Problem**: Images not uploading to Cloudinary

**Solutions**:
1. Verify Cloudinary credentials
2. Check network connectivity
3. Verify file permissions in uploads directory
4. Check browser console for errors

### Frontend Build Issues

**Problem**: Frontend won't start or build

**Solutions**:
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# Check for JavaScript errors in browser console
```

### Environment Variable Issues

**Problem**: App not recognizing environment variables

**Solutions**:
1. Verify `.env` files exist and have correct names
2. Restart services after changing environment variables
3. Check for typos in variable names
4. Ensure no spaces around `=` in `.env` files

## Performance Optimization

### Development Mode

- Use Docker for consistent environment
- Enable hot reloading for faster development
- Use browser dev tools for debugging
- Monitor API response times

### Production Testing

```bash
# Build production frontend
cd frontend
npm run build

# Test production build locally
npx serve -s build -l 8081
```

## Next Steps

After successful local setup:

1. **Customize Features**: Modify components and add new functionality
2. **Deploy**: Use deployment guides for Render (paid/free tier)
3. **Monitor**: Set up logging and monitoring for production
4. **Scale**: Consider performance optimizations for larger datasets

For deployment, see:
- [Render Deployment (Paid)](./RENDER_DEPLOYMENT_PAID.md)
- [Render Deployment (Free)](./RENDER_DEPLOYMENT_FREE.md)
