# Render Deployment Guide (Free Tier)

This guide covers deploying the Marketing Post Scheduler to Render's free tier with optimizations to handle free tier limitations.

## Free Tier Limitations

Render's free tier has these constraints:

- **Sleep Mode**: Services spin down after 15 minutes of inactivity
- **Cold Start**: 30-60 second startup delay when service wakes up
- **Limited Resources**: Reduced CPU and memory allocation
- **No Persistent Storage**: Use external databases (MongoDB Atlas works perfectly)

## Prerequisites

1. **Render Account**: [Create free account](https://render.com)
2. **MongoDB Atlas**: Free tier database
3. **Cloudinary Account**: Free tier for image storage
4. **OpenAI API Key** (optional): For AI features

## Deployment Steps

### 1. Repository Setup

Ensure your code is in a Git repository accessible to Render.

### 2. Create Blueprint Instance

1. Log in to Render dashboard
2. Click **"New"** → **"Blueprint"**
3. Connect your repository
4. Render detects `render.yaml` and creates services

### 3. Configure Environment Variables

Set these in your **backend service**:

```env
# Database
MONGO_USERNAME=your_atlas_username
MONGO_PASSWORD=your_atlas_password
MONGO_CLUSTER=your_cluster.mongodb.net
MONGO_APP_NAME=your_app_name
NODE_ENV=production

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Features (optional)
OPENAI_API_KEY=your_openai_key
```

### 4. Deploy and Test

1. Deploy both services
2. Test the application thoroughly
3. Expect initial cold start delays

## Free Tier Optimizations

### Backend Optimizations

The application includes several optimizations for free tier:

1. **Enhanced Health Endpoint** (`/api/health`)
   - Tracks uptime and service status
   - Provides free tier status information
   - Helps monitor when service is active

2. **Startup Notifications**
   - Clear console messages about free tier limitations
   - Warns about potential delays on first request

3. **Keep-Alive Script** (`backend/utils/keep-alive.js`)
   - Pings backend every 14 minutes to prevent sleep
   - Can be deployed to external cron services

### Frontend Optimizations

1. **API Retry Logic**
   - Automatic retry when backend is spinning up
   - Configurable retry count and delays
   - Handles cold start error codes gracefully

2. **Loading Context**
   - Shows "Service is waking up" notifications
   - Improves user experience during cold starts
   - Visual feedback for service status

3. **Enhanced Error Handling**
   - Graceful handling of timeout errors
   - User-friendly messages for service delays

## Keeping Your Service Awake

### Option 1: External Cron Service (Recommended)

1. **Deploy Keep-Alive Script**:
   - Use the provided `backend/utils/keep-alive.js`
   - Deploy to a free cron service like [cron-job.org](https://cron-job.org)
   - Set to run every 14 minutes

2. **Setup Instructions**:

   ```bash
   # The script pings your backend URL
   # Configure it to hit: https://your-backend-url.onrender.com/api/health
   ```

### Option 2: UptimeRobot (Alternative)

1. Create free account at [UptimeRobot](https://uptimerobot.com)
2. Add HTTP monitor for your backend URL
3. Set check interval to 5 minutes
4. This keeps your service active during business hours

### Option 3: Upgrade to Paid Plan

Consider upgrading if you need:

- Consistent performance without cold starts
- More resources for your application
- Custom domains and SSL certificates

## Monitoring Free Tier Performance

### Health Check Endpoint

Monitor your service at: `https://your-backend-url.onrender.com/api/health`

Response includes:

- Service status and uptime
- Environment information
- Free tier notifications
- Database connection status

### Expected Behavior

- **First Request**: 30-60 second delay if service was sleeping
- **Active Period**: Normal response times when service is awake
- **Sleep Timer**: Service sleeps after 15 minutes of inactivity

## Troubleshooting Free Tier Issues

### Cold Start Problems

**Symptoms**: Long loading times, timeout errors
**Solutions**:

- Implement keep-alive strategy
- Use retry logic in frontend
- Inform users about potential delays

### Resource Limitations

**Symptoms**: Slow performance, memory errors
**Solutions**:

- Optimize database queries
- Reduce image sizes before upload
- Limit concurrent operations

### Build Failures

**Symptoms**: Deployment fails during build
**Solutions**:

- Check build logs for memory issues
- Simplify build process if needed
- Ensure dependencies are optimized

## Cost Considerations

### Free Tier Limits

- 750 hours/month of service time
- Shared resources with other users
- Services sleep when inactive

### When to Upgrade

Consider paid tier when:

- You need 24/7 availability
- Cold starts impact user experience significantly
- You require more computational resources
- You want custom domains

## Best Practices for Free Tier

1. **Optimize for Intermittent Use**
   - Design for cold start delays
   - Implement proper loading states
   - Use external keep-alive services

2. **Resource Management**
   - Minimize memory usage
   - Optimize database connections
   - Use efficient algorithms

3. **User Communication**
   - Set expectations about potential delays
   - Provide clear loading indicators
   - Implement graceful error handling

## Testing Your Free Tier Deployment

1. **Initial Test**: Wait 20 minutes, then access your app to test cold start
2. **Performance Test**: Use the app normally to verify functionality
3. **Keep-Alive Test**: Verify your keep-alive solution works
4. **Error Handling**: Test how the app handles service delays

The free tier is perfect for development, testing, and low-traffic applications. With proper optimizations, it provides a solid foundation for your marketing tool.
