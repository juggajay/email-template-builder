# Stable Version Recovery Checklist

## 🚨 Emergency Rollback Procedure

If the app breaks after changes, follow these steps:

### 1. Immediate Rollback (Fastest)
```bash
# Rollback to last stable version
git reset --hard 4f10950

# Force push to main (be careful!)
git push origin main --force
```

### 2. Safe Rollback (Recommended)
```bash
# Create backup of current state
git branch backup-broken-state

# Checkout stable version
git checkout 4f10950

# Create new branch
git checkout -b fix-from-stable

# Cherry-pick any good commits if needed
git cherry-pick <commit-hash>

# Push and create PR
git push origin fix-from-stable
```

## 🛡️ Protection Strategies

### Git Tags for Stable Versions
```bash
# Tag current stable version
git tag -a v0.1.2-stable -m "Stable version with security features"
git push origin v0.1.2-stable

# Future: checkout tagged version
git checkout v0.1.2-stable
```

### Backup Critical Files
```bash
# Create backup directory
mkdir ../email-template-backup-2025-01-18
cp -r src/lib/security ../email-template-backup-2025-01-18/
cp -r src/components/editor ../email-template-backup-2025-01-18/
cp .env.production.example ../email-template-backup-2025-01-18/
```

## 📋 Pre-Change Checklist

Before making any significant changes:

- [ ] Create a new branch (don't work on main)
- [ ] Run `npm run build` to ensure it builds
- [ ] Document what you're changing
- [ ] Test locally thoroughly
- [ ] Check Vercel preview deployment
- [ ] Only merge to main when confirmed working

## 🔧 Common Fixes

### If Vercel build fails:
1. Check build logs for specific error
2. Common issues:
   - Missing environment variables
   - Module not found (check .vercelignore)
   - TypeScript errors

### If authentication breaks:
1. Verify Supabase keys haven't changed
2. Check Supabase service is running
3. Verify environment variables in Vercel

### If security features cause issues:
1. Temporarily disable in development:
   ```typescript
   // In rate-limit.ts, add bypass for development
   if (process.env.NODE_ENV === 'development') {
     return null; // Bypass rate limiting
   }
   ```

### If database errors occur:
1. Check if migrations were run
2. Verify Supabase connection
3. Check RLS policies

## 🎯 Critical Do's and Don'ts

### DO:
- ✅ Always test build before pushing
- ✅ Keep backups of working .env configs
- ✅ Use feature branches
- ✅ Check Vercel preview deployments
- ✅ Run migrations in Supabase when needed

### DON'T:
- ❌ Force push to main without backup
- ❌ Change security middleware without testing
- ❌ Modify core files without understanding
- ❌ Delete "unused" files without checking
- ❌ Commit real credentials

## 📱 Contact for Help

If you need to restore from a catastrophic failure:
1. Check this document first
2. Use git history to find last working commit
3. Restore from git tag v0.1.2-stable
4. Check VERSION_CONTROL.md for working configuration

---
Remember: The current stable version (0.1.2) has all security features working and tested. When in doubt, rollback to this version.