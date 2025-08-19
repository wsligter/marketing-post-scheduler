# Marketing Post Scheduler

A full-stack application for planning and scheduling marketing campaigns across social media platforms. Built with Node.js, React, MongoDB, and Docker.

## 🚀 Quick Start

Get the application running locally in minutes:

```bash
# Clone the repository
git clone <your-repo-url>
cd marketing_tool

# Start with Docker (recommended)
docker-compose up

# OR start with Just (if installed)
just start
```

**Access the application:**
- **Frontend:** [http://localhost:8081](http://localhost:8081)
- **Backend API:** [http://localhost:3002](http://localhost:3002)

## ✨ Features

- **Campaign Management**: Create and organize marketing campaigns
- **Post Scheduling**: Schedule posts for specific dates and times
- **Image Management**: Upload and manage images via Cloudinary integration
- **Calendar View**: Visual calendar for scheduled posts
- **Status Tracking**: Track post status (draft, scheduled, published)
- **AI Content Generation**: AI-powered writing assistance for post creation
- **User Management**: Multi-user support with reviewer assignments
- **Mobile Responsive**: Optimized for mobile devices

## 🛠 Tech Stack

- **Frontend**: React.js with responsive design
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary
- **Containerization**: Docker
- **AI Integration**: OpenAI API

## 📚 Documentation

### Getting Started
- **[Local Development Guide](./README_LOCAL_DEVELOPMENT.md)** - Complete setup and testing instructions
- **[Project Structure](./README_LOCAL_DEVELOPMENT.md#project-structure)** - Understanding the codebase

### Deployment
- **[Render Deployment (Paid)](./README_RENDER_DEPLOYMENT_PAID.md)** - Deploy to Render paid tier
- **[Render Deployment (Free)](./README_RENDER_DEPLOYMENT_FREE.md)** - Deploy to Render free tier with optimizations

### Configuration
- **[Environment Variables](./LOCAL_DEVELOPMENT.md#environment-variables)** - Required configuration
- **[Database Setup](./LOCAL_DEVELOPMENT.md#database-setup)** - MongoDB Atlas configuration
- **[Cloudinary Setup](./LOCAL_DEVELOPMENT.md#cloudinary-integration)** - Image storage configuration

## 🔧 Quick Commands

```bash
# Development
just start              # Start all services
just stop               # Stop all services
just logs               # View logs
just build              # Build containers

# Version management
just bump-patch         # Increment patch version
just bump-minor         # Increment minor version
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally using the [Local Development Guide](./LOCAL_DEVELOPMENT.md)
5. Submit a pull request

## 📄 License

MIT
