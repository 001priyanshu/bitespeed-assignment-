# Bitespeed Identity Reconciliation API

This project implements an identity reconciliation system that links customer contacts (based on email and/or phone number) and returns a unified identity structure.

Hosted on: [Railway](https://bitespeed-assignment-production-bb8a.up.railway.app/)

---

## 🔧 Tech Stack

- Node.js
- Express.js
- PostgreSQL (hosted via Railway)
- Sequelize ORM
- Deployed on Railway

---

## Project Structure 

- controllers/
- models/
- routes/
- config/
- index.js
- .env
- package.json


## 🚀 Setup Instructions

### 1. Clone the Repository and install dependency

```bash
git clone https://github.com/your-username/bitespeed-assignment.git
cd bitespeed-assignment

npm install
```
### 2. Create a .env File
```
PORT=3000
DATABASE_URL=your_postgresql_connection_url
```

### 3. Run Server
```bash
npm start
```

-🧪 API Endpoint

POST /identify

```curl
curl --location 'https://bitespeed-assignment-production-bb8a.up.railway.app/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "john@example.com",
  "phoneNumber": "1234567893"
}'
```
Response 
```
{
    "contact": {
        "primaryContactId": 1,
        "emails": [
            "john@example.com"
        ],
        "phoneNumbers": [
            "1234567892",
            "1234567893"
        ],
        "secondaryContactIds": [
            2
        ]
    }
}
```

GET /health
```curl
curl --location 'bitespeed-assignment-production-bb8a.up.railway.app/health'
```
Response
```
{ "status": "OK" }
```



