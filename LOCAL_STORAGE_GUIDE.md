# Local Storage Mode Guide

This project supports **two storage modes**: AWS S3 (production) and Local Storage (development). You can develop and test the entire system **without AWS S3** using local file storage.

---

## 🎯 Quick Start (No AWS Required)

### 1. Skip AWS Setup
You don't need to:
- Create AWS account
- Set up S3 bucket
- Configure IAM users
- Add AWS credentials to `.env`

### 2. Configure Backend `.env`

Create `backend/.env` with **only** the database configuration:

```env
# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres

# AWS S3 Configuration - LEAVE EMPTY for local storage
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# S3_BUCKET_NAME=

# Optional: Custom local storage path (defaults to "storage")
# LOCAL_STORAGE_PATH=storage
```

**That's it!** The system will automatically detect that S3 is not configured and use local storage instead.

---

## 📁 How Local Storage Works

### File Storage Location

Files are stored in: `backend/storage/calls/`

Structure:
```
backend/
└── storage/
    └── calls/
        ├── uuid1.wav
        ├── uuid2.mp3
        └── uuid3.m4a
```

### How It Works

1. **Frontend requests upload URL** → Backend returns local endpoint
2. **Frontend uploads file** → Backend receives and saves to `storage/calls/`
3. **Metadata stored in database** → Same as S3 mode (s3_key format: `calls/uuid.ext`)

### API Behavior

- **`POST /uploads/presign`**: Returns local upload endpoint instead of S3 presigned URL
- **`POST /uploads/local/{s3_key}`**: Receives file uploads in local mode
- **`GET /uploads/storage-mode`**: Returns `{"mode": "local"}` or `{"mode": "s3"}`

---

## 🔄 Switching Between Modes

### Using Local Storage (Current Setup)

**`.env` file:**
```env
DATABASE_URL=postgresql://...
# No AWS credentials
```

**Result:** Files stored in `backend/storage/calls/`

### Switching to S3 (When Ready)

**`.env` file:**
```env
DATABASE_URL=postgresql://...
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket
```

**Result:** Files uploaded directly to S3, no local storage used

**No code changes needed!** The system automatically detects which mode to use.

---

## 📝 Database Schema

The database schema is **identical** for both modes:

- `s3_key` field stores: `calls/uuid.ext` (same format for both)
- For local storage: `s3_key` points to `storage/calls/uuid.ext`
- For S3: `s3_key` points to S3 object key

**Migration to S3:** When you switch to S3, existing database records work as-is. You just need to upload the files from `storage/calls/` to your S3 bucket.

---

## 🚀 Development Workflow

### Current Setup (Local Storage)

1. **Start backend:**
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Upload files:**
   - Files automatically saved to `backend/storage/calls/`
   - Check the directory to see uploaded files
   - Database stores metadata normally

### Testing

- Upload works exactly like S3 mode
- Files are accessible locally
- Database integration works identically
- All Phase 0 features work without AWS

---

## 📦 Dependencies

### Required (Always)
- `fastapi`, `uvicorn`, `sqlalchemy`, etc. (all in `requirements.txt`)

### Optional (Only for S3)
- `boto3` - Only needed if using S3

**Note:** `boto3` is in `requirements.txt` but the code works without it. If you want to skip installing it:

```bash
# Install without boto3
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic pydantic-settings python-multipart python-dotenv
```

---

## 🔒 Security Notes

### Local Storage
- Files stored on your development machine
- **Not suitable for production** (no redundancy, no CDN, etc.)
- Perfect for development and testing

### S3 (Production)
- Files stored in AWS S3
- Scalable, redundant, secure
- Use for production deployments

---

## 🗂️ File Management

### Viewing Uploaded Files

**Local Storage:**
```bash
# List uploaded files
ls backend/storage/calls/

# View file details
ls -lh backend/storage/calls/
```

**S3:**
- Use AWS Console → S3 → Your bucket → `calls/` folder

### Cleaning Up

**Local Storage:**
```bash
# Remove all uploaded files (keeps database records)
rm -rf backend/storage/calls/*

# Or delete specific file
rm backend/storage/calls/uuid.wav
```

**Note:** Deleting files doesn't remove database records. You may want to add cleanup logic later.

---

## 🔄 Migrating to S3 Later

When you're ready to use S3:

1. **Set up AWS S3** (see SETUP_GUIDE.md)
2. **Add credentials to `.env`**
3. **Restart backend** - it will automatically switch to S3 mode
4. **(Optional) Migrate existing files:**
   - Upload files from `storage/calls/` to S3 bucket
   - Use same `s3_key` values (database records stay the same)

---

## ✅ Benefits of Local Storage Mode

- ✅ **No AWS account needed** for development
- ✅ **No costs** during development
- ✅ **Faster iteration** (no S3 API calls)
- ✅ **Easy file inspection** (just check the folder)
- ✅ **Same API interface** (easy to switch to S3 later)
- ✅ **Perfect for testing** and development

---

## 🐛 Troubleshooting

### Files Not Saving

**Check:**
- `backend/storage/` directory exists
- Backend has write permissions
- Check backend logs for errors

**Solution:**
```bash
# Create storage directory manually
mkdir -p backend/storage/calls
```

### Storage Mode Detection

**Check current mode:**
```bash
curl http://localhost:8000/api/uploads/storage-mode
```

Should return: `{"mode": "local"}` or `{"mode": "s3"}`

### File Not Found After Upload

**Check:**
- File exists in `backend/storage/calls/`
- `s3_key` in database matches filename
- Check backend logs for upload errors

---

## 📚 Related Documentation

- **SETUP_GUIDE.md** - Full setup instructions (includes S3 setup)
- **PHASE_0_REPORT.md** - Technical architecture details
- **README.md** - Quick reference

---

**You're all set!** Develop and test the entire system without AWS. Switch to S3 when you're ready for production! 🚀

