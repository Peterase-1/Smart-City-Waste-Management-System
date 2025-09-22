# 🚀 Simple Setup Guide for Beginners

## Step 1: Install PostgreSQL

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for 'postgres' user
4. Open pgAdmin (comes with PostgreSQL)

### Create Database:
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `waste_management`
4. Click "Save"

## Step 2: Run Database Schema

### Option A: Using pgAdmin (Easiest)
1. Open pgAdmin
2. Right-click on `waste_management` database
3. Click "Query Tool"
4. Copy and paste the entire content from `database_schema.sql`
5. Click "Execute" (F5)

### Option B: Using Command Line
```bash
# Open Command Prompt as Administrator
psql -U postgres -d waste_management -f docs/database_schema.sql
```

## Step 3: Update Database Password

Edit `config/database.js` and change the password:

```javascript
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'waste_management',
  password: 'YOUR_POSTGRES_PASSWORD', // ← Change this
  port: 5432,
});
```

## Step 4: Install Dependencies

```bash
cd backend
npm install
```

## Step 5: Start the Server

```bash
npm run dev
```

## Step 6: Test the API

Open your browser and go to:
- http://localhost:3000/health
- http://localhost:3000/

## 🧪 Test with Sample Data

The database already includes sample data:
- 3 sample users (admin, operator, citizen)
- 5 sample waste bins
- 3 sample collection trucks

## 🔧 Troubleshooting

### "Connection refused" error:
- Make sure PostgreSQL is running
- Check if the password is correct
- Verify the database name is `waste_management`

### "Database does not exist" error:
- Create the database in pgAdmin first
- Run the schema file

### "Module not found" error:
- Run `npm install` in the backend folder

## 📝 Quick Test Commands

```bash
# Test health
curl http://localhost:3000/health

# Test bins (should work without authentication)
curl http://localhost:3000/api/bins

# Test statistics
curl http://localhost:3000/api/bins/statistics
```

## 🎯 What You'll See

When everything works, you should see:
```
🚀 Smart City Waste Management API running on port 3000
📊 Health check: http://localhost:3000/health
📚 API Documentation: http://localhost:3000/
🌍 Environment: development
```

## 🆘 Need Help?

1. Check if PostgreSQL is running
2. Verify the database password
3. Make sure you created the `waste_management` database
4. Check the console for error messages

That's it! You now have a working Smart City Waste Management API! 🎉
