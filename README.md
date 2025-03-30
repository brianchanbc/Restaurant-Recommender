# Restaurant Recommendation System

## Project Setup

### Run Backend Server

```bash
cd backend

python -m venv venv

pip install -r requirements.txt

source venv/bin/activate

uvicorn api.main:app --reload
```

### Run Frontend Server

```bash
cd frontend

npm install

npm run build (only for the first time or when you change the frontend code)

npm run dev
```

### Query Database 

```bash
cd backend/db

sqlite3 recommender.db

.tables

.schema 

select * from user;
select * from restaurant;
select * from review;
```

### Password Management

```bash
cd backend

touch .env

# Replace {INSERT ACTUAL KEY} with your actual Yelp API key
echo "YELP_API_KEY={INSERT ACTUAL KEY}" >> .env
```