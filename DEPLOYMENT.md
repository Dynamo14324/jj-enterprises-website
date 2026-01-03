# Deployment Guide - JJ Enterprises Website

## Pre-Deployment Checklist

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# SEO Verification
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-verification-code

# Social Media Links (optional)
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/jjenterprises
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/jjenterprises
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/jjenterprises
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/jjenterprises
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@jjenterprises

# API Endpoints (if applicable)
NEXT_PUBLIC_API_URL=https://api.jjenterprises.com
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://analytics.jjenterprises.com/api/vitals

# Feature Flags
NEXT_PUBLIC_ENABLE_3D_CONFIGURATOR=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Build Verification

1. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Run Type Check**
   ```bash
   npx tsc --noEmit
   ```

3. **Run Linter**
   ```bash
   npm run lint
   ```

4. **Build Production Bundle**
   ```bash
   npm run build
   ```

5. **Test Production Build Locally**
   ```bash
   npm run start
   ```

### Security Audit

- [ ] All environment variables are set
- [ ] No hardcoded secrets in code
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Input validation in place
- [ ] Rate limiting configured

### Performance Audit

- [ ] Lighthouse score > 90
- [ ] Bundle size optimized
- [ ] Images optimized (WebP/AVIF)
- [ ] Code splitting enabled
- [ ] 3D components lazy loaded
- [ ] Fonts preloaded

### Accessibility Audit

- [ ] WCAG AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] ARIA labels present

---

## Deployment Platforms

### Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `.` (or your project root)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**
   - Add all variables from `.env.production`
   - Set in Vercel dashboard: Settings → Environment Variables

4. **Deploy**
   - Push to main branch triggers automatic deployment
   - Or manually deploy from dashboard

### Netlify

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**
   - Add in Site settings → Environment variables

3. **Deploy**
   - Connect Git repository
   - Auto-deploy on push

### Docker

1. **Build Image**
   ```bash
   docker build -t jj-enterprises:latest .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX \
     jj-enterprises:latest
   ```

### Self-Hosted (Node.js)

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm run start
   ```

3. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "jj-enterprises" -- start
   pm2 save
   pm2 startup
   ```

---

## Post-Deployment Verification

### Functional Testing

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] All pages accessible
- [ ] Forms submit successfully
- [ ] 3D configurator loads
- [ ] Images display properly
- [ ] Links work correctly

### Performance Testing

- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Largest Contentful Paint < 2.5 seconds
- [ ] Cumulative Layout Shift < 0.1

### Security Testing

- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No console errors in production
- [ ] No sensitive data exposed
- [ ] CSRF tokens working

### Analytics Verification

- [ ] Google Analytics tracking
- [ ] Web Vitals reporting
- [ ] Error tracking (if configured)
- [ ] Conversion tracking

---

## Monitoring & Maintenance

### Error Monitoring

Set up error tracking service (e.g., Sentry):

1. **Install Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure**
   ```javascript
   // sentry.client.config.js
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   })
   ```

### Performance Monitoring

- Monitor Core Web Vitals
- Track API response times
- Monitor bundle sizes
- Track error rates

### Regular Updates

- Update dependencies monthly
- Security patches immediately
- Review and update content
- Monitor analytics for issues

---

## Rollback Procedure

### Vercel

1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

### Netlify

1. Go to Deploys
2. Find previous deployment
3. Click "Publish deploy"

### Self-Hosted

1. Revert to previous Git commit
2. Rebuild and restart:
   ```bash
   git checkout <previous-commit>
   npm run build
   pm2 restart jj-enterprises
   ```

---

## Troubleshooting

### Build Failures

**Issue**: TypeScript errors
**Solution**: Run `npx tsc --noEmit` locally and fix errors

**Issue**: Missing dependencies
**Solution**: Ensure `package.json` has all required dependencies

**Issue**: Environment variables missing
**Solution**: Check all required variables are set in deployment platform

### Runtime Errors

**Issue**: 3D configurator not loading
**Solution**: 
- Check WebGL support
- Verify Three.js bundle loaded
- Check browser console for errors

**Issue**: Images not loading
**Solution**:
- Verify image paths
- Check Next.js image configuration
- Ensure images are in `public` folder

**Issue**: Forms not submitting
**Solution**:
- Check API endpoints
- Verify CSRF tokens
- Check rate limiting

---

## Support

For deployment issues:
- Check build logs in deployment platform
- Review error tracking service
- Check server logs
- Contact development team

---

*Last updated: $(date)*

