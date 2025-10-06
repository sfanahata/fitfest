# Sentry Source Maps Setup Guide

## Overview
Your Sentry integration now has robust source map configuration. This guide explains what was set up and how to use it.

## What Was Configured

### 1. Next.js Configuration (`next.config.js`)
- ✅ **Source map uploads enabled** with `widenClientFileUpload: true`
- ✅ **Source maps hidden from client bundles** with `hideSourceMaps: true` (security)
- ✅ **Tunnel route enabled** to bypass ad-blockers (`/monitoring`)
- ✅ **Enhanced source map configuration** with proper include/ignore patterns
- ✅ **Removed duplicate config file** (`next.config.ts`)

### 2. Sentry CLI Configuration (`.sentryclirc`)
- ✅ **Organization and project settings** configured
- ⚠️ **Auth token placeholder** - needs to be updated with your actual token

### 3. Build Scripts (`package.json`)
- ✅ **Production build script** added that includes Sentry auth token
- ✅ **Regular build script** maintained for development

## Required Setup Steps

### 1. Get Your Sentry Auth Token
1. Go to [Sentry Settings > Auth Tokens](https://sentry.io/settings/auth-tokens/)
2. Create a new token with these scopes:
   - `project:releases`
   - `project:write`
3. Copy the token

### 2. Update Configuration Files

#### For Local Development
Add to your `.env.local` file:
```bash
SENTRY_AUTH_TOKEN=your-actual-sentry-auth-token-here
```

#### For CI/CD (GitHub Actions)
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add a new repository secret:
   - Name: `SENTRY_AUTH_TOKEN`
   - Value: Your actual Sentry auth token

The CI workflow has been updated to automatically use this token for source map uploads.

### 3. Test Source Map Upload
Run the production build to test source map uploads:
```bash
npm run build:production
```

You should see Sentry uploading source maps during the build process.

## How It Works

### Development
- Source maps are generated but not uploaded to Sentry
- Use `npm run dev` for development

### Production
- Source maps are generated and uploaded to Sentry
- Source maps are hidden from client bundles (security)
- Use `npm run build:production` for production builds

### Error Tracking
When errors occur in production:
1. Sentry receives the error with stack trace
2. Sentry uses the uploaded source maps to show original source code
3. You get readable stack traces with actual file names and line numbers

## Security Features

- **Hidden source maps**: Source maps are not served to browsers
- **Tunnel route**: Errors are sent through `/monitoring` to bypass ad-blockers
- **Auth token**: Secure authentication for source map uploads

## Troubleshooting

### Source Maps Not Uploading
1. Check that `SENTRY_AUTH_TOKEN` is set correctly
2. Verify org and project names in `.sentryclirc`
3. Check build logs for Sentry upload messages

### Errors Not Showing Source Code
1. Ensure source maps were uploaded successfully
2. Check that the error occurred after the source map upload
3. Verify the release version matches between error and source maps

## Next Steps

1. **Set up your Sentry auth token** (see steps above)
2. **Test with a production build** to verify source map uploads
3. **Deploy and test error tracking** to see source maps in action
4. **Consider setting up releases** for better source map organization

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/)
- [Release Management](https://docs.sentry.io/product/releases/)
