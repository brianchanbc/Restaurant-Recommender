# Restaurant Recommendation System

## Tech Stack
**Frontend**: React, Vite, TypeScript, CSS

**Backend**: FastAPI, Python

**Containerization**: Docker

**Database**: SQLite

**API**: Yelp API

## Project Setup

### Prerequisites

**Yelp API Key**

```bash
cd backend

touch .env

# Replace {INSERT ACTUAL KEY} with your actual Yelp API key
echo "YELP_API_KEY={INSERT ACTUAL KEY}" >> .env
```

**Restaurant Recommender User Registration**

See common issue #2 below.

### Docker Setup

```bash
# Ensure proxy target in 'vite.config.ts' and 'vite.config.js' in /frontend are set to 'target: 'http://backend:8000','

docker compose up # Website runs on http://localhost:5173
```

### Local Setup

#### Run Backend Server

```bash
cd backend

python -m venv venv

pip install -r requirements.txt

source venv/bin/activate

uvicorn api.main:app --reload
```

#### Run Frontend Server

```bash
# Ensure proxy target in 'vite.config.ts' and 'vite.config.js' in /frontend are set to 'target: 'http://localhost:8000','

cd frontend

npm install

npm run build (only for the first time or when you change the frontend code)

npm run dev # Website runs on http://localhost:5173
```

### Query Database 

```bash
cd backend/db

sqlite3 recommender.db

sql> .tables

sql> .schema 

sql> select * from user;
sql> select * from restaurant;
sql> select * from review;
```

### Create a Database (only if you want to create a new one)

```bash
cd backend/db

python -m venv venv

pip install -r requirements.txt

source venv/bin/activate

python create_tables.py
```

### Common Issues

1. Running in Docker vs Locally: Note that current settings are configured to run on Docker containers. If you need to run it locally, you need to change the target proxy of the frontend. In 'vite.config.ts' and 'vite.config.js' in /backend, change the line 'target: 'http://backend:8000',' to 'target: 'http://localhost:8000','.

2. The backend server is configured to allow only dedicated users/emails to register for an account to mimic a real-world scenario for security sake. In a real-world application, we could authenticate against a company database like an employee table or an external service. While we could do that by inserting new records in the SQL database, we opted for a simpler way for quick testing, please directly update the record in backend/api/authentication/user_lookup.py and use emails/users that are in the list to register or else you would get an error setting up. 
