# IQRA School Management System (MERN)

Production-grade, role-based School Management System built with the MERN stack.

## Features
- Role-based dashboards: Admin, Teacher, Student, Parent
- JWT authentication with RBAC and password reset (mock email)
- Academic management: classes, subjects, routines, exams, marks
- Finance: invoices, payments (Stripe), income/expense ledger
- SMS notifications (Twilio)
- File uploads (Multer) with cloud-ready hooks
- Internal messaging between roles
- Settings for school info, language, and SMS

## Project Structure
```
/client   React + Vite frontend
/server   Node + Express backend
```

## Environment
Create `.env` in `server` using `server/.env.example` as a guide.

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/iqra
JWT_SECRET=change_this_secret
JWT_RESET_SECRET=change_reset_secret
CLIENT_ORIGIN=http://localhost:5173
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+123456789
STRIPE_SECRET_KEY=your_stripe_secret
```

## Install & Run
### Backend
```
cd server
npm install
npm run dev
```

### Frontend
```
cd client
npm install
npm run dev
```

## Seed Demo Data
```
cd server
npm run seed
```

## API Overview
Base URL: `http://localhost:5000/api`

- `/api/auth`
- `/api/users`
- `/api/classes`
- `/api/subjects`
- `/api/routines`
- `/api/exams`
- `/api/marks`
- `/api/attendance`
- `/api/invoices`
- `/api/payments`
- `/api/finance`
- `/api/events`
- `/api/library`
- `/api/dormitory`
- `/api/transport`
- `/api/messages`
- `/api/settings`
- `/api/upload`
- `/api/sms`

## Notes
- No real media assets are included. Replace placeholders as needed.
- Stripe and Twilio calls are mocked if credentials are missing.
- All list endpoints support pagination via `?page=` and `?limit=` with optional `?q=` search when applicable.
