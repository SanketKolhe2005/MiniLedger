# MiniLedger — Personal Lending Tracker

MiniLedger is a full-stack application for tracking money lent to friends. It helps users record loans, monitor repayments, identify overdue payments, and view a summary of their lending activity.

The project includes a TypeScript backend connected to PostgreSQL and a React Native frontend built with Expo.

## Features

- **Mock Phone OTP Login:** Demonstration login using an OTP printed in the backend terminal.
- **Add Loans:** Record a friend's name, loan amount, and due date.
- **Loan List:** View recorded loans and their repayment status.
- **Repayment Tracking:** Mark a loan as repaid.
- **Summary Dashboard:** Display total lent, total repaid, and overdue amounts.
- **Overdue Identification:** Highlight unpaid loans past their due date.

## Technology Stack

### Frontend
- React Native
- Expo
- TypeScript
- Expo Router

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- PostgreSQL `pg` client
- `dotenv`

## Project Structure

```text
MiniLedger/
├── backend/
│   ├── src/
│   │   ├── db.ts
│   │   └── server.ts
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── mobile/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   └── global.css
│   ├── assets/
│   ├── scripts/
│   ├── app.json
│   ├── expo-env.d.ts
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following:

- Node.js and npm
- PostgreSQL
- Git (optional for running locally)
- Visual Studio Code (recommended)

## Database Setup

1. Start your local PostgreSQL server.
2. Create a database named `miniledger`.
3. Open the `miniledger` database in pgAdmin.
4. Create the `friends` and `loans` tables.

The `friends` table must be created before the `loans` table because each loan references a friend.

## Backend Setup

Open a terminal in the project directory and run:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder. Use `.env.example` as a template if it is available.

Example environment configuration:

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=miniledger
DB_USER=postgres
DB_PASSWORD=your_local_postgres_password
```

Replace the example password with your local PostgreSQL password. Never upload your actual `.env` file to GitHub.

Start the backend:

```bash
npx tsx src/server.ts
```

The backend should run at:

`http://localhost:5000`

Keep the backend terminal open while using the application.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check whether the API is running |
| GET | `/api/health/db` | Check the PostgreSQL connection |
| POST | `/api/auth/send-otp` | Generate a mock OTP |
| POST | `/api/auth/verify-otp` | Verify a mock OTP |
| GET | `/api/loans` | Retrieve loans |
| POST | `/api/loans` | Create a loan |
| PATCH | `/api/loans/:id/repay` | Mark a loan as repaid |
| GET | `/api/summary` | Retrieve lending summary totals |

These endpoints reflect the API routes implemented in the project.

### Example: Create a Loan

Request: `POST /api/loans`

```json
{
  "friendName": "Rahul",
  "amount": 1500,
  "dueDate": "2026-12-31"
}
```

### Example: Summary Response

Request: `GET /api/summary`

```json
{
  "total_lent": "1500.00",
  "total_repaid": "0",
  "overdue_amount": "0"
}
```

The returned values depend on the data in the database and the due dates of pending loans.

## Frontend Setup

Open a second terminal in the project directory:

```bash
cd mobile
npm install
npx expo start
```

To run the application in a browser, use the web option in Expo or run:

```bash
npx expo start --web
```

For a physical phone, configure the frontend API URL to use your computer's local network IP address rather than `localhost`. Ensure the phone and computer can communicate over the same network.

## Mock OTP Login

The application uses a mock OTP flow for demonstration purposes. The backend prints the generated OTP in its terminal. Use that OTP to test the login screen.

This is a development-only authentication flow and is not intended for production use.

## Testing

The following checks can be performed:

1. Start PostgreSQL and verify the database connection.
2. Start the backend and check the database health endpoint.
3. Add a test loan and confirm it appears in the application.
4. Verify that the dashboard totals update.
5. Mark a pending loan as repaid and confirm the repayment status.
6. Test the mock OTP login flow.
7. Check overdue highlighting using an unpaid loan with a past due date.

## Security

- Keep `.env` and all database passwords private.
- Exclude `node_modules/`, `.expo/`, and generated build files from the repository.
- Use mock OTP only for demonstration.
- Add appropriate authentication, authorization, and validation before production deployment.

## Author

Developed as a Full Stack Development internship assignment for **Credsetu Technologies**.
