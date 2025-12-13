# Healthcare Appointment System

A full-stack healthcare appointment management system with role-based access control (Patient, Doctor, Admin).

## Project Structure

- **`backend/`**: Node.js/Express API server with MongoDB.
- **`frontend/`**: React application built with Vite and Tailwind CSS.

## Features

- **Authentication**: Secure Signup and Login with JWT.
- **Role-Based Dashboards**:
    - **Patient**: Book appointments, view history, cancel appointments.
    - **Doctor**: View scheduled appointments, update appointment status.
    - **Admin**: Manage users, view system stats.
- **Appointment Management**: Full flow from booking to confirmation/cancellation.
- **Responsive Design**: Modern UI with Tailwind CSS.

## Getting Started

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    - Create a `.env` file (copy from `.env.example` if available).
    - Set `MONGODB_URI` to your MongoDB connection string.
    - Set `JWT_SECRET` to a secure string.
    - Set `PORT` (default: 4000).
4.  Start the server:
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:4000`.

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Usage

1.  **Sign Up**: Create a new account. By default, new users are **Patients**.
2.  **Login**: Sign in with your credentials.
3.  **Patient Dashboard**:
    - Book an appointment by selecting a doctor, date, and time.
    - View upcoming and past appointments.
    - Cancel pending appointments.
4.  **Doctor/Admin Access**:
    - Currently, roles are managed in the database.
    - To test Doctor/Admin features, you may need to manually update the user role in MongoDB to `doctor` or `admin`.

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/appointments` | Create a new appointment |
| GET | `/api/appointments` | Get user's appointments |
| PUT | `/api/appointments/:id/cancel` | Cancel an appointment |

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
