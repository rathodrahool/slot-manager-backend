# Slot Manager Backend | NestJS

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Docker (optional)
- npm (v8 or higher)

## Initial Setup
1. Install NestJS CLI globally:
```bash
npm install -g @nestjs/cli
```

2. Install project dependencies:
```bash
npm install
```

3. Create environment files:
   - Create `.env.localhost`
   - Create `.env.development`
   - Create `.env.staging`
   - Create `.env.production`

## Database Setup & Migrations

### Local Environment
```bash
# Run migrations
npm run migration:up:localhost

# Revert migrations
npm run migration:down:localhost
```

### Development Environment
```bash
# Run migrations
npm run migration:up:development

# Revert migrations
npm run migration:down:development
```

### Staging Environment
```bash
# Run migrations
npm run migration:up:staging

# Revert migrations
npm run migration:down:staging
```

### Production Environment
```bash
# Run migrations
npm run migration:up:production

# Revert migrations
npm run migration:down:production
```

## Running the Application

### Local Development
```bash
npm run start:localhost
```

### Development Server
```bash
npm run start:development
```

### Staging Server
```bash
npm run start:staging
```

### Production Server
```bash
npm run start:prod
```

## PM2 Deployment

### Local Environment
```bash
npm run pm2:localhost
```

### Staging Environment
```bash
npm run pm2:staging
```

### Production Environment
```bash
npm run pm2:production
```

## Docker Setup

1. Build Docker image:
```bash
npm run docker:build
```

2. Start containers:
```bash
npm run docker:up
```

3. Stop containers:
```bash
npm run docker:down
```

4. Restart containers:
```bash
npm run docker:restart
```

## Development Tools

### Creating Migrations
```bash
# Auto-detect changes
npm run migration:generate src/migrations/name

# Custom migration
npx typeorm migration:create src/migrations/name
```

### Creating Seeders
```bash
npx typeorm migration:create src/seeders/name
```

## Features

- User Authentication & Authorization
- Role Based Access Control
- Slot Management System
- Real-time Updates
- Database Migration Support
- Data Seeding
- API Documentation with Swagger
- Environment Configuration
- Error Handling & Logging

## Modules

- Auth Module
  - JWT Authentication
  - User Registration
  - Login Management
  
- User Module
  - User Management
  - Profile Management
  - Role Management

- Slot Module
  - Slot Creation
  - Slot Booking
  - Availability Management
  - Schedule Management

- Common Module
  - Shared Services
  - Utils
  - Guards
  - Decorators
