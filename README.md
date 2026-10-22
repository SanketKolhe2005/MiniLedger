# MiniLedger — Personal Lending Tracker

MiniLedger is a simple application that helps users track money lent to friends, monitor repayments, and identify overdue loans. It includes a React Native application built with Expo and a Node.js backend connected to PostgreSQL.

## Features

- **Phone OTP Login:** Mock OTP authentication for demonstration purposes.
- **Add Loans:** Record a friend's name, loan amount, and due date.
- **Loan Tracking:** View loans and their repayment status.
- **Repayment Management:** Mark pending loans as repaid.
- **Summary Dashboard:** View total lent, total repaid, and overdue amounts.
- **Overdue Highlighting:** Identify unpaid loans whose due dates have passed.

## Technology Stack

**Frontend**
- React Native
- Expo
- TypeScript

**Backend**
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- `pg` PostgreSQL client
- `dotenv` for environment configuration

## Project Structure

```text
MiniLedger/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   └── db.ts
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
├── mobile/
│   ├── src/
│   │   └── app/
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

- Node.js and npm
- PostgreSQL
- Visual Studio Code (recommended)

## Database Setup

1. Start PostgreSQL.
2. Create a database named `miniledger`.
3. Open the database in pgAdmin and execute the SQL statements that create the `friends` and `loans` tables.

The `loans` table references the `friends` table. Create `friends` first.

## Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` using `.env.example` as a template. Set the database credentials for your local PostgreSQL installation.

Example configuration:

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=miniledger
DB_USER=postgres
DB_PASSWORD=your_local_postgres_password
```

Replace the example password with your actual local PostgreSQL password. Never commit `.env` to GitHub.

Start the backend:

```bash
npx tsx src/server.ts
```

The API should run at:

`http://localhost:5000`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check that the API is running |
| GET | `/api/health/db` | Check the database connection |
| POST | `/api/auth/send-otp` | Generate a mock OTP |
| POST | `/api/auth/verify-otp` | Verify the mock OTP |
| GET | `/api/loans` | Retrieve loans |
| POST | `/api/loans` | Create a loan |
| PATCH | `/api/loans/:id/repay` | Mark a loan as repaid |
| GET | `/api/summary` | Retrieve lending summary totals |

### Add Loan Request Example

`POST /api/loans`

```json
{
  "friendName": "Rahul",
  "amount": 1500,
  "dueDate": "2026-12-31"
}
```

### Summary Response Example

`GET /api/summary`

```json
{
  "total_lent": "1500.00",
  "total_repaid": "0",
  "overdue_amount": "0"
}
```

The values depend on the loans currently stored in the database.

## Frontend Setup

Open a second terminal:

```bash
cd mobile
npm install
npx expo start
```

To run the application in a browser, use the web option provided by Expo or run:

```bash
npx expo start --web
```

For a physical phone, configure the frontend API URL to use your computer's local network IP address instead of `localhost`. Ensure both devices are on the same network and that the backend is reachable.

## Mock OTP Authentication

This project uses a mock OTP for demonstration purposes. The generated OTP is printed in the backend terminal. Enter that OTP in the app to test the login flow.

**Note:** This is a demonstration implementation, not production-grade authentication.

## Testing

1. Start PostgreSQL and verify the database connection.
2. Start the backend and check `/api/health/db`.
3. Test adding a loan.
4. Verify the summary totals.
5. Mark a loan as repaid and verify the updated totals.
6. Test the login screen and dashboard in the frontend.

## Security Notes

- Do not upload `.env`, passwords, or private credentials.
- Do not upload `node_modules/` or generated build files.
- Use mock OTP authentication for demonstration only.
- Configure real authentication, authorization, and appropriate security controls before production use.

## Author

Developed as a Full Stack Development internship assignment for **Credsetu Technologies**.
