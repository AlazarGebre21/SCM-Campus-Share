# Step-by-Step Commit Guide

## ✅ Pre-Commit Checklist

**Files that WILL be committed:**
- ✅ All Go source code (`.go` files)
- ✅ `go.mod` and `go.sum` (dependencies)
- ✅ `README.md` (documentation)
- ✅ `API_INTEGRATION_GUIDE.md` (frontend guide)
- ✅ `.gitignore` (git configuration)
- ✅ `LICENSE` (license file)

**Files that WILL NOT be committed (properly ignored):**
- ✅ `.env` (contains sensitive passwords - IGNORED)
- ✅ `bin/` directory (build outputs - IGNORED)
- ✅ `*.exe`, `*.test`, `*.log` (build artifacts - IGNORED)
- ✅ IDE files (`.vscode/`, `.idea/` - IGNORED)

---

## Step-by-Step Instructions

### Step 1: Check Current Status
```powershell
git status
```
This shows what files will be added.

### Step 2: Switch to Backend Branch
```powershell
# Checkout the existing backend branch (or create new one)
git checkout -b Backend
# OR if backend branch exists remotely:
git checkout Backend
```

### Step 3: Verify What Will Be Committed
```powershell
# See what files will be added
git status

# Double-check .env is NOT in the list
git status | Select-String ".env"
# Should return nothing (empty)
```

### Step 4: Add Files to Staging
```powershell
# Add all files (respects .gitignore)
git add .

# Verify what's staged
git status
```

### Step 5: Review Staged Files (IMPORTANT!)
```powershell
# See exactly what will be committed
git diff --cached --name-only

# Make sure .env is NOT in this list!
# You should see:
# - .gitignore
# - API_INTEGRATION_GUIDE.md
# - README.md
# - cmd/
# - go.mod
# - go.sum
# - internal/
# - pkg/
# - LICENSE (if exists)
```

### Step 6: Commit with Descriptive Message
```powershell
git commit -m "feat: Initial backend implementation

- Implemented complete REST API with Go and Gin framework
- Added authentication with JWT tokens
- Created resource management (upload, download, search, filter)
- Implemented comments, ratings, and bookmarks features
- Added PostgreSQL database with GORM ORM
- Integrated S3-compatible cloud storage
- Created comprehensive API documentation for frontend team
- Added CORS middleware and error handling
- Implemented user profile management
- Added database migrations support"
```

### Step 7: Push to Backend Branch
```powershell
# Push to remote backend branch
git push origin Backend

# If this is the first push to this branch:
git push -u origin Backend
```

---

## Quick One-Liner Commands (After Verification)

If you've verified everything is correct, you can run:

```powershell
# 1. Switch to backend branch
git checkout -b Backend

# 2. Add all files
git add .

# 3. Verify .env is NOT included
git status | Select-String ".env"
# (Should be empty - if you see .env, STOP and check .gitignore)

# 4. Commit
git commit -m "feat: Initial backend implementation with complete REST API"

# 5. Push
git push -u origin Backend
```

---

## ⚠️ Important Safety Checks

### Before Committing, Verify:

1. **No sensitive data:**
   ```powershell
   git status | Select-String "\.env"
   # Should return nothing
   ```

2. **No build artifacts:**
   ```powershell
   git status | Select-String "\.exe|bin/|\.test"
   # Should return nothing
   ```

3. **No database files:**
   ```powershell
   git status | Select-String "\.db|\.sqlite"
   # Should return nothing
   ```

4. **Check what's actually staged:**
   ```powershell
   git diff --cached --name-only
   # Review this list carefully!
   ```

---

## If Something Goes Wrong

### If you accidentally added .env:
```powershell
# Remove from staging (but keep the file locally)
git reset HEAD .env

# Verify it's removed
git status
```

### If you need to undo the commit:
```powershell
# Undo last commit (keeps changes)
git reset --soft HEAD~1

# Or completely remove the commit
git reset --hard HEAD~1
```

---

## After Successful Commit

1. ✅ Verify on GitHub/GitLab that:
   - `.env` is NOT visible
   - All source code is present
   - Documentation files are included

2. ✅ Test that the backend still works:
   ```powershell
   go run cmd/server/main.go
   ```

3. ✅ Share the commit with your team!

---

**Remember:** Always review `git status` and `git diff --cached` before committing!

