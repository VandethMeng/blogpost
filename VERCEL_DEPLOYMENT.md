# Vercel Deployment Guide

## Required Environment Variables

Configure these in Vercel Dashboard → Project Settings → Environment Variables:

### 1. MONGODB_URI (Required)

Your MongoDB connection string. Get this from MongoDB Atlas.

```
mongodb+srv://username:password@cluster.mongodb.net/blogpostdb?retryWrites=true&w=majority
```

**Important**: Make sure the database name is `blogpostdb`

### 2. JWT_SECRET (Required)

A strong random string for JWT token signing (minimum 32 characters).

```
your-super-secret-jwt-key-change-this-in-production-123456789
```

**Security**: Use a strong random string. You can generate one at: https://randomkeygen.com/

## Deployment Steps

1. **Push your code to GitHub** (already done)
2. **Go to Vercel Dashboard**: https://vercel.com/dashboard

3. **Import your GitHub repository**:
   - Click "Add New..." → "Project"
   - Select your `blogpost` repository
   - Click "Import"

4. **Configure Environment Variables**:
   - In the import screen, expand "Environment Variables"
   - Add:
     - `MONGODB_URI` = your MongoDB connection string
     - `JWT_SECRET` = your secret key
   - Apply to: Production, Preview, and Development

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (2-3 minutes)

6. **Verify**:
   - Visit your deployment URL
   - Test login/signup
   - Create a post
   - Add a comment

## Troubleshooting

### Posts not showing:

- ✅ **Fixed**: Now using direct database queries instead of HTTP fetch
- Check Vercel logs for errors: Project → Deployments → [Click your deployment] → Function Logs

### Environment variables not working:

- Go to Project Settings → Environment Variables
- Make sure variables are added to "Production"
- Redeploy after adding variables

### MongoDB connection errors:

- Verify your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow all) or Vercel's IPs
- Check your connection string format
- Test connection locally first

### JWT/Auth errors:

- Ensure `JWT_SECRET` is set and is at least 32 characters long
- Check browser cookies are enabled

## After Deployment

Your app will be live at: `https://your-project-name.vercel.app`

Every push to the `main` branch will automatically trigger a new deployment.
