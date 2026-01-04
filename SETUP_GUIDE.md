# Setup Guide - Getting Started with Support Auditor

This guide walks you through setting up the Support Auditor system from scratch.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ and npm installed
- [ ] PostgreSQL installed (or access to a cloud database)
- [ ] AWS account created
- [ ] Git installed (for cloning/pulling)

---

## Step 1: Clone/Verify Repository

If you're collaborating:
```bash
git clone <your-repo-url>
cd sentiment-flow
```

If you already have the repo:
```bash
cd sentiment-flow
git pull  # Get latest changes
```

---

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL:**
   - **Windows:** Download from https://www.postgresql.org/download/windows/
   - **Mac:** `brew install postgresql` or download installer
   - **Linux:** `sudo apt-get install postgresql` (Ubuntu/Debian)

2. **Start PostgreSQL service:**
   - **Windows:** Services app → Start "postgresql-x64-XX" service
   - **Mac/Linux:** `sudo service postgresql start` or `brew services start postgresql`

3. **Create database:**
   ```bash
   # Open PostgreSQL command line
   psql -U postgres
   
   # Or if you have a different user:
   psql -U your_username
   ```

   Then in psql:
   ```sql
   CREATE DATABASE support_auditor;
   \q  -- Exit psql
   ```

4. **Note your connection details:**
   - Default username: `postgres`
   - Default password: (whatever you set during installation)
   - Default port: `5432`
   - Database name: `support_auditor`

### Option B: Cloud PostgreSQL (Alternative)

Use services like:
- **AWS RDS** (PostgreSQL)
- **Heroku Postgres**
- **ElephantSQL** (free tier available)
- **Supabase** (free tier available)

Get the connection string from your provider (format: `postgresql://user:password@host:port/database`)

---

## Step 3: Set Up AWS S3

### 3.1 Create S3 Bucket

1. **Log into AWS Console:**
   - Go to https://aws.amazon.com/console/
   - Sign in or create account

2. **Navigate to S3:**
   - Search for "S3" in services
   - Click "Create bucket"

3. **Configure bucket:**
   - **Bucket name:** Choose unique name (e.g., `support-auditor-calls-2025`)
   - **Region:** Choose closest region (e.g., `us-east-1`)
   - **Block Public Access:** Keep enabled (we use presigned URLs, not public access)
   - Click "Create bucket"

### 3.2 Create IAM User for S3 Access

1. **Go to IAM Console:**
   - Search for "IAM" in services
   - Click "Users" → "Create user"

2. **Set user details:**
   - **User name:** `support-auditor-s3-user`
   - Click "Next"

3. **Attach permissions:**
   - Select "Attach policies directly"
   - Search for and select: `AmazonS3FullAccess` (or create custom policy with only `PutObject` and `GetObject`)
   - Click "Next" → "Create user"

4. **Create access keys:**
   - Click on the new user
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next" → "Create access key"
   - **IMPORTANT:** Copy both:
     - **Access key ID**
     - **Secret access key** (only shown once!)

### 3.3 Configure CORS (For Direct Browser Uploads)

1. **Go back to S3 bucket:**
   - Click on your bucket name
   - Go to "Permissions" tab
   - Scroll to "Cross-origin resource sharing (CORS)"
   - Click "Edit"

2. **Add CORS configuration:**
   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["PUT", "POST", "GET"],
           "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
           "ExposeHeaders": ["ETag"],
           "MaxAgeSeconds": 3000
       }
   ]
   ```
   - Click "Save changes"

---

## Step 4: Backend Setup

### 4.1 Navigate to Backend

```bash
cd backend
```

### 4.2 Create Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 4.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 4.4 Create `.env` File

Create a file named `.env` in the `backend/` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/support_auditor

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

**Replace:**
- `your_password` with your PostgreSQL password
- `your_access_key_here` with AWS Access Key ID
- `your_secret_key_here` with AWS Secret Access Key
- `us-east-1` with your S3 bucket region
- `your-bucket-name` with your actual bucket name

**Example:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/support_auditor
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=support-auditor-calls-2025
```

### 4.5 Run Database Migrations

```bash
# Set Python path (Windows PowerShell)
$env:PYTHONPATH="."

# Or (Mac/Linux)
export PYTHONPATH=.

# Generate initial migration
python -m alembic revision --autogenerate -m "Initial migration"

# Apply migration to create tables
python -m alembic upgrade head
```

**Expected output:**
```
INFO  [alembic.runtime.migration] Running upgrade  -> abc123, Initial migration
```

### 4.6 Verify Database Tables

```bash
# Connect to PostgreSQL
psql -U postgres -d support_auditor

# Check tables
\dt

# Should see:
#  public | alembic_version | table
#  public | calls          | table

# Exit
\q
```

### 4.7 Start Backend Server

```bash
uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**Test it:**
- Open browser: http://localhost:8000/health
- Should see: `{"status":"ok"}`

**Keep this terminal open!** The server needs to keep running.

---

## Step 5: Frontend Setup

### 5.1 Open New Terminal

Open a **new terminal window** (keep backend running in the first one).

### 5.2 Navigate to Frontend

```bash
cd frontend
```

### 5.3 Install Dependencies

```bash
npm install
```

This may take a minute or two.

### 5.4 Start Frontend Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open in browser:** http://localhost:5173

---

## Step 6: Test the System

### 6.1 Test Health Check

1. Open: http://localhost:8000/health
2. Should see: `{"status":"ok"}`

### 6.2 Test Frontend

1. Open: http://localhost:5173
2. You should see the app with "Upload Call" and "Calls List" buttons

### 6.3 Test Upload Flow

1. **Go to Upload page** (click "Upload Call" button)
2. **Select an audio file:**
   - Use any `.wav`, `.mp3`, `.m4a`, etc.
   - Or create a test file (any audio file works)
3. **Click "Upload"**
4. **Watch the status messages:**
   - "Getting presigned URL..."
   - "Uploading to S3..."
   - "Registering call metadata..."
   - "Upload successful!"

### 6.4 Verify Upload

1. **Check Calls List:**
   - Click "Calls List" button
   - Should see your uploaded call in the table

2. **Check S3 Bucket:**
   - Go to AWS Console → S3
   - Open your bucket
   - Should see file in `calls/` folder

3. **Check Database:**
   ```bash
   psql -U postgres -d support_auditor
   SELECT * FROM calls;
   ```
   Should see your call record.

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Database connection error**
```
psycopg2.OperationalError: connection refused
```
**Solution:**
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Test connection: `psql -U postgres -d support_auditor`

**Problem: Migration errors**
```
Target database is not up to date
```
**Solution:**
```bash
python -m alembic upgrade head
```

**Problem: S3 errors**
```
Could not generate presigned URL
```
**Solution:**
- Verify AWS credentials in `.env`
- Check bucket name matches exactly
- Verify IAM user has S3 permissions
- Check AWS region matches bucket region

### Frontend Issues

**Problem: Can't connect to backend**
```
Network Error or CORS error
```
**Solution:**
- Ensure backend is running on port 8000
- Check `vite.config.ts` proxy settings
- Verify frontend is on port 5173

**Problem: Upload fails**
```
Upload failed. Check console for details.
```
**Solution:**
- Open browser DevTools (F12) → Console tab
- Check for specific error messages
- Verify S3 CORS is configured correctly
- Check presigned URL hasn't expired (try again)

### Database Issues

**Problem: Table doesn't exist**
```
relation "calls" does not exist
```
**Solution:**
```bash
cd backend
$env:PYTHONPATH="."
python -m alembic upgrade head
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend server running on http://localhost:8000
- [ ] Health check returns `{"status":"ok"}`
- [ ] Frontend loads on http://localhost:5173
- [ ] Can navigate between Upload and Calls List pages
- [ ] Can upload an audio file successfully
- [ ] Uploaded call appears in Calls List
- [ ] File appears in S3 bucket
- [ ] Record exists in PostgreSQL `calls` table

---

## 🚀 Next Steps After Setup

Once everything is working:

1. **Test with different file types** (`.wav`, `.mp3`, `.m4a`)
2. **Upload multiple files** and verify they all appear
3. **Check S3 bucket** to see organized file structure
4. **Review database** to see metadata storage
5. **Plan Phase 1** features (transcription, AI analysis)

---

## 📝 Important Notes

### Security
- **Never commit `.env` file** to Git (already in `.gitignore`)
- **Rotate AWS keys** periodically
- **Use IAM roles** in production (not access keys)

### Development vs Production
- Current setup is for **local development**
- Production will need:
  - Environment-specific `.env` files
  - Proper CORS origins (not `*`)
  - Database connection pooling
  - HTTPS for frontend
  - AWS IAM roles instead of access keys

### File Size Limits
- No file size validation yet
- S3 has 5GB limit per object (default)
- Consider adding size limits in future

---

## 🆘 Getting Help

If you're stuck:

1. **Check error messages** in terminal and browser console
2. **Verify all prerequisites** are installed
3. **Review `.env` file** for typos
4. **Test each component** separately (DB, S3, backend, frontend)
5. **Check PHASE_0_REPORT.md** for architecture details

---

**You're all set!** 🎉

The system is now ready for Phase 0 testing and development.

