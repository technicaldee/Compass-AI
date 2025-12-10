# Deployment Guide

## Prerequisites

- Node.js 18+ or Docker
- Environment variables configured
- API keys for external services (optional)

## Local Development

### Using npm

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

### Using Docker

```bash
# Build image
docker build -t mastra-insight-assistant .

# Run container
docker run -p 3000:3000 --env-file .env mastra-insight-assistant
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Production Deployment

### Environment Variables

Required environment variables:

```bash
NODE_ENV=production
PORT=3000
MASTRA_API_KEY=your_key_here
LOG_LEVEL=info
```

Optional (for external data sources):
```bash
GITHUB_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
WEATHER_API_KEY=your_key_here
```

### Deployment Options

#### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Configure environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

#### Railway

1. Connect GitHub repository to Railway
2. Configure environment variables
3. Railway will auto-deploy on push

#### Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Configure environment variables

#### AWS/Google Cloud/Azure

Use Docker container deployment:

```bash
# Build and push to container registry
docker build -t your-registry/mastra-insight-assistant .
docker push your-registry/mastra-insight-assistant

# Deploy using your cloud provider's container service
```

### Health Checks

The application includes a health check endpoint:

```bash
GET /api/v1/health
```

Configure your deployment platform to use this endpoint for health checks.

### Monitoring

- **Logs**: Application logs are written to `combined.log` and `error.log`
- **Metrics**: Available via `/api/v1/health/metrics`
- **Health**: Check `/api/v1/health` for system status

### Scaling Considerations

1. **Stateless Design**: Application is stateless, easy to scale horizontally
2. **Memory Storage**: Current implementation uses in-memory storage
   - For production, replace with database (PostgreSQL, MongoDB, etc.)
3. **Caching**: Consider Redis for distributed caching
4. **Load Balancing**: Use load balancer for multiple instances

### Database Migration (Future)

When migrating to database:

1. Replace `projectMemory` with database adapter
2. Replace `conversationMemory` with database adapter
3. Update cache manager to use Redis
4. Run migrations for schema setup

### Security Checklist

- [ ] Environment variables secured
- [ ] API keys rotated regularly
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] HTTPS enabled
- [ ] Security headers (Helmet) enabled
- [ ] Input validation enabled
- [ ] Error messages don't leak sensitive info

### Performance Tuning

1. **Caching**: Adjust cache TTL based on usage patterns
2. **Rate Limiting**: Adjust limits based on expected load
3. **Connection Pooling**: Configure for external APIs
4. **Monitoring**: Set up alerts for performance metrics

### Backup Strategy

1. **Project Data**: Backup database regularly
2. **Logs**: Rotate and archive logs
3. **Configuration**: Version control environment configs

### Troubleshooting

#### Application won't start

- Check environment variables are set
- Verify port is not in use
- Check logs for errors

#### High memory usage

- Reduce cache TTL
- Implement cache size limits
- Consider database instead of in-memory

#### Slow responses

- Check external API response times
- Review cache hit rates
- Optimize agent processing

#### External API errors

- Verify API keys are valid
- Check rate limits
- Review fallback mechanisms

## CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      # Add deployment steps here
```

## Rollback Strategy

1. Keep previous version tagged
2. Use blue-green deployment
3. Monitor health checks
4. Rollback if health checks fail

