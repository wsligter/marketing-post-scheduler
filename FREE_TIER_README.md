# Marketing Tool - Free Tier Deployment Guide

This guide explains the optimizations made to run the Marketing Tool application on Render's free tier.

## Free Tier Limitations

Render's free tier has the following limitations:

- Services automatically spin down after 15 minutes of inactivity
- There's a startup delay (30-60 seconds) when the service spins up after being inactive
- Limited resources (CPU and memory)
- No persistent disk storage (but we use MongoDB Atlas for data persistence)

## Optimizations Implemented

### Backend Optimizations

1. **Health Endpoint Enhancement**
   - Added uptime tracking
   - Improved health check response with free tier information
   - Added server startup notification

2. **Startup Notification**
   - Added clear console messages about free tier limitations
   - Warns about potential 30-60 second delay on first request after inactivity

3. **Keep-Alive Script**
   - Created `backend/utils/keep-alive.js` which can be run on a cron job service
   - Pings the backend every 14 minutes to prevent it from sleeping
   - Can be deployed to a free cron job service like cron-job.org

### Frontend Optimizations

1. **API Retry Logic**
   - Added automatic retry mechanism for API calls when backend is spinning up
   - Configurable retry count and delay between retries
   - Handles common error codes that indicate the backend is starting up

2. **User Experience**
   - Added LoadingContext provider to show a "Service is waking up" notification
   - Provides visual feedback when the backend is spinning up
   - Improves user experience during cold starts

3. **URL Handling**
   - Enhanced URL handling to work with Render's service naming conventions
   - Ensures proper protocol is always used

## Deployment Configuration

The `render.yaml` file has been updated to:

1. Use explicit URLs instead of service references
2. Add Cache-Control headers to prevent stale content
3. Configure proper routes for the frontend SPA

## How to Keep Your Service Awake

To prevent your service from sleeping, you have two options:

1. **Use the keep-alive script**:
   - Deploy `backend/utils/keep-alive.js` to a cron job service
   - Set it to run every 14 minutes
   - This will ping your backend and keep it awake

2. **Upgrade to a paid plan**:
   - If you need consistent performance without cold starts
   - If you need more resources for your application

## Monitoring

The enhanced health endpoint at `/api/health` provides:

- Service status
- Uptime information
- Environment configuration (without exposing sensitive data)
- Free tier notification

You can monitor this endpoint to check if your service is running properly.
