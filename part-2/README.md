# Greenboard — Employee Management System

Greenboard is a MERN stack employee management app with a responsive black-and-green interface. Users can register and sign in, then manage their own employee records from a protected dashboard.

## Features

- JWT-based registration and login with hashed passwords
- Protected employee API routes and per-account employee records
- Create, view, update, and delete employee records
- Employee search and department filtering
- Client-side form validation and server-side request validation
- Mongoose models, centralized API error handling, and duplicate-email checks
- Idempotent script for adding fictional sample employees

## Technology

- **Frontend:** React, Vite, Axios, Lucide
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens and bcrypt

## Project structure

```text
part-2/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── server/
│   └── src/
│       ├── data/
│       │   └── sampleEmployees.js
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       │   └── seedEmployees.js
│       └── index.js
├── .env.example
├── package.json
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database, either a local MongoDB server or MongoDB Atlas

## Setup and run

1. Open a terminal in the `part-2` folder and install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` in the project root.
3. Configure the environment variables:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/greenboard
   JWT_SECRET=replace-this-with-a-long-random-secret
   JWT_EXPIRES_IN=1d
   CLIENT_URL=http://localhost:5173
   ```

   For Atlas, use the connection string provided by Atlas as `MONGODB_URI`. Replace its placeholders locally, URL-encode special characters in the database password, and ensure your IP is allowed in Atlas Network Access. Keep `.env` private; never commit database credentials or JWT secrets.

4. Start the frontend and API:

   ```sh
   npm run dev
   ```

5. Visit [http://localhost:5173](http://localhost:5173), create an account, and add employees. The API runs on port `5000` by default; Vite proxies `/api` requests to it.

The API connects to MongoDB during startup. If the connection or required environment variables are invalid, the server reports an error and does not start.

## Add sample employees

Register an account in the app first. Once MongoDB is connected, run this command from `part-2`, replacing the email with the registered account email:

```sh
npm run seed:employees -- you@company.com
```

The command adds five fictional employees to that account. It is safe to rerun: matching sample records are left unchanged. These sample records use `example.com` email addresses and are for development/demo purposes.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API and Vite development server together |
| `npm run dev:server` | Start the API with Nodemon |
| `npm run dev:client` | Start the Vite frontend |
| `npm start` | Start the API |
| `npm run build` | Create the frontend production build |
| `npm run preview` | Preview the production frontend build |
| `npm run seed:employees -- <email>` | Add sample employees to an existing account |

## REST API

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register with `name`, `email`, and `password` |
| `POST` | `/auth/login` | Sign in with `email` and `password`; returns a JWT |
| `GET` | `/auth/me` | Return the authenticated account |

### Employees

Employee endpoints require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/employees` | List employees; optional `search` and `department` query parameters |
| `POST` | `/employees` | Create an employee |
| `PATCH` | `/employees/:id` | Update an employee |
| `DELETE` | `/employees/:id` | Delete an employee |

Employee records contain `name`, `email`, `phone`, `position`, `department`, `salary`, `status`, and `joiningDate`. Status must be `Active`, `On leave`, or `Inactive`. The API assigns ownership from the authenticated user; clients cannot choose or change record ownership.

### Health check

`GET /api/health` returns `{ "status": "ok" }` when the API is running.
