# Docker Build Instructions

## Important: Clear Cache Before Building

If you see errors about `dist/index.js` or backend code, you likely have cached Docker layers. Always rebuild with `--no-cache`:

```bash
# From root directory
docker build --no-cache -t compass-ai-frontend .

# Or with docker-compose
docker-compose build --no-cache
docker-compose up
```

## Build Process

1. **Stage 1 (deps)**: Installs all npm dependencies
2. **Stage 2 (builder)**: Builds the Next.js application with `npm run build`
3. **Stage 3 (runner)**: Creates final image with only necessary files

## What Gets Copied

- `.next/standalone/` - Contains the Next.js server and dependencies
- `.next/static/` - Static assets
- `server.js` - Entry point (from standalone output)

## Troubleshooting

### Error: Cannot find module '/app/dist/api/server'
- **Cause**: Cached Docker layers from old backend build
- **Solution**: Rebuild with `--no-cache` flag

### Error: Cannot find module 'server.js'
- **Cause**: Standalone output not generated correctly
- **Solution**: Check that `output: 'standalone'` is in `next.config.js`

### Build fails at npm run build
- **Cause**: Missing files or dependencies
- **Solution**: Ensure all frontend files are copied correctly in builder stage

## Verify Build

After building, check the image:
```bash
docker run --rm compass-ai-frontend ls -la /app
```

You should see:
- `server.js` (Next.js standalone server)
- `.next/` directory
- `node_modules/` directory
- `package.json`

