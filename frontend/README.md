# Marketing Tool Frontend

This is the frontend for the Marketing Tool application, a tool for managing marketing campaigns and scheduling social media posts.

## Project Structure

The project follows a feature-based organization pattern:

```plaintext
frontend/src/
├── assets/              # Static assets like images and icons
├── components/          # React components organized by feature
│   ├── common/          # Shared components used across features
│   │   ├── Modal.js     # Modal dialog component
│   │   └── index.js     # Exports all common components
│   ├── campaigns/       # Campaign-specific components
│   │   ├── CampaignForm.js
│   │   ├── CampaignsList.js
│   │   └── index.js     # Exports all campaign components
│   └── posts/           # Post-specific components
│       ├── PostForm.js
│       ├── PostsList.js
│       └── index.js     # Exports all post components
├── pages/               # Page-level components
│   ├── CampaignsPage.js # Main page for campaigns tab
│   ├── PostSchedulerPage.js # Main page for posts tab
│   └── index.js         # Exports all pages
├── styles/              # CSS files
│   ├── global.css       # Global styles and shared UI components
│   ├── campaigns.css    # Campaign-specific styles
│   └── posts.css        # Post-specific styles
├── App.js               # Main app with routing
└── index.js             # Entry point
```

## Key Features

- **Campaigns Management**: Create, edit, and delete marketing campaigns
- **Social Media Post Scheduler**: Schedule and manage social media posts
- **Modal Component**: Reusable modal dialog for forms and confirmations

## CSS Organization

The CSS is organized into three main files:

1. **global.css**: Contains global styles, variables, and shared UI component styles like Modal
2. **campaigns.css**: Contains all styles related to campaign management
3. **posts.css**: Contains all styles related to post scheduling

This organization makes it easier to maintain and update styles for specific features without affecting others.

## Development

To start the development server:

```bash
npm start
```

The application will be available at <http://localhost:8081>.
