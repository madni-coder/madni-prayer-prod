# Supabase Connection Debugging Guide

## Issue: "MaxClientsInSessionMode: max clients reached"

This error occurs when using Supabase Session Pooler instead of Transaction Pooler in serverless environments (Vercel).

---

## ✅ Solution Applied (Based on Official Prisma Docs)

### 1. Use Transaction Pooler (Port 6543)
```env
DATABASE_URL=postgresql://postgres.[PROJECT]:PASSWORD@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### 2. Use Direct Connection for Migrations (Port 5432)
```env
DATABASE_DIRECT_URL=postgresql://postgres.[PROJECT]:PASSWORD@aws-0-[region].pooler.supabase.com:5432/postgres
```

---

## 🔍 How to Verify Your Setup

### Check 1: Verify Connection String Port
```bash
echo $DATABASE_URL | grep -o ":[0-9]*/" 
# Should show ":6543/" for Transaction Pooler
```

### Check 2: Test Database Connection Locally
```bash
npm run prisma generate
npm run prisma db pull
```

### Check 3: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment → Functions
3. Look for connection errors in the logs

---

## 📊 Connection Limits by Type

| Connection Type | Port | Max Connections | Use Case |
|----------------|------|----------------|----------|
| Direct Database | 5432 | ~60-100 | Migrations, long-running tasks |
| Session Pooler | 5432 | ~15-20 | Long sessions (NOT for serverless) |
| **Transaction Pooler** | **6543** | **Unlimited** | **Serverless (Vercel)** ✅ |

---

## 🚨 Common Mistakes

### ❌ Wrong: Using Session Pooler (causes your error)
```env
DATABASE_URL=...pooler.supabase.com:5432/postgres
```

### ✅ Correct: Using Transaction Pooler
```env
DATABASE_URL=...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

---

## 🔗 Official Documentation

- **Prisma + Supabase:** https://www.prisma.io/docs/v6/orm/overview/databases/supabase
- **Supabase Connection Pooling:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling-in-depth
- **Vercel Serverless Functions:** https://vercel.com/docs/functions/serverless-functions

---

## 🛠️ Alternative Solution: Prisma Accelerate

If you continue to have issues, consider using **Prisma Accelerate** for enterprise-grade connection pooling:

1. Sign up: https://www.prisma.io/data-platform/accelerate
2. Add to your project:
```bash
npm install @prisma/extension-accelerate
```

3. Update prisma.js:
```javascript
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())
```

---

## ✅ Expected Behavior After Fix

- ✅ No connection errors after deployment
- ✅ APIs work immediately (no 10-minute wait)
- ✅ Can handle concurrent traffic without connection pool exhaustion
- ✅ Faster cold starts on Vercel

---

## 📧 Still Having Issues?

1. Check Vercel environment variables match your .env
2. Verify you're using Transaction Pooler (port 6543)
3. Ensure `connection_limit=1` is in the DATABASE_URL
4. Check Supabase logs for connection attempts
5. Verify your database isn't paused (Supabase free tier)
