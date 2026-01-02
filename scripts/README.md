# Admin User Creation Scripts

## Option 1: Go Script (Recommended)

This script creates an admin user with properly hashed password, matching the authentication system.

### Usage

**From project root directory:**

```bash
go run scripts/create_admin.go
```

### Environment Variables (Optional)

You can customize the admin credentials via environment variables:

```bash
# Windows PowerShell
$env:ADMIN_EMAIL="admin@campus.edu"
$env:ADMIN_PASSWORD="YourSecurePassword123!"
$env:ADMIN_FIRST_NAME="Admin"
$env:ADMIN_LAST_NAME="User"
go run scripts/create_admin.go

# Linux/Mac
export ADMIN_EMAIL="admin@campus.edu"
export ADMIN_PASSWORD="YourSecurePassword123!"
export ADMIN_FIRST_NAME="Admin"
export ADMIN_LAST_NAME="User"
go run scripts/create_admin.go
```

### Default Credentials

If no environment variables are set, the script uses:
- **Email:** `admin@campus.edu`
- **Password:** `Admin123!`
- **First Name:** `Admin`
- **Last Name:** `User`

### Database Connection

The script uses the same database connection as your main application:
- Reads from `.env` file (via environment variables)
- Or uses defaults: `localhost:5432`, database `campus_share`, user `postgres`

### Features

- ✅ Properly hashes password using bcrypt (same as auth service)
- ✅ Checks if admin already exists (won't create duplicate)
- ✅ Updates existing user to admin if needed
- ✅ Uses same UUID generation as the application

---

## Option 2: SQL Script (Quick Alternative)

If you prefer SQL, you can use this script. **Note:** You'll need to generate the bcrypt hash yourself.

### Step 1: Generate Password Hash

Run this Go one-liner to get the bcrypt hash:

```bash
go run -c 'package main; import ("fmt"; "golang.org/x/crypto/bcrypt"; "os"); func main() { hash, _ := bcrypt.GenerateFromPassword([]byte(os.Args[1]), bcrypt.DefaultCost); fmt.Println(string(hash)) }' "YourPassword123!"
```

Or use an online bcrypt generator (search "bcrypt generator").

### Step 2: Run SQL

```sql
-- Replace the password_hash with the bcrypt hash from step 1
-- Replace email, first_name, last_name as needed

INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    is_banned,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@campus.edu',
    '$2a$10$YourBcryptHashHere...',  -- Replace with actual hash
    'Admin',
    'User',
    'admin',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET role = 'admin', is_active = true;
```

---

## Verification

After running either script, verify the admin user:

```sql
SELECT email, role, is_active, is_banned FROM users WHERE email = 'admin@campus.edu';
```

Should show:
- `email`: `admin@campus.edu`
- `role`: `admin`
- `is_active`: `true`
- `is_banned`: `false`

---

## Login

Use these credentials to login via the frontend:

- **Email:** `admin@campus.edu` (or your custom email)
- **Password:** `Admin123!` (or your custom password)

**⚠️ Important:** Change the password after first login for security!

---

## Troubleshooting

**Error: "Failed to connect to database"**
- Make sure PostgreSQL is running
- Check your `.env` file has correct database credentials
- Verify database `campus_share` exists

**Error: "User already exists"**
- The script will update existing user to admin role
- If you want a different email, set `ADMIN_EMAIL` environment variable

**Password doesn't work**
- Make sure you're using the exact password (case-sensitive)
- If you changed it via SQL, make sure bcrypt hash is correct

