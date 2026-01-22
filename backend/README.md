# Nath Krupa Travels - Backend API

Backend server for Nath Krupa Travels booking platform built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required environment variables (see main README)

3. Create admin user:
```bash
npm run create-admin
```

4. Start server:
```bash
npm run dev
```

## API Documentation

See main README.md for complete API endpoint documentation.

## Project Structure

- `controllers/` - Business logic for each feature
- `models/` - MongoDB schemas
- `routes/` - API route definitions
- `middleware/` - Authentication and error handling
- `utils/` - Email service, Cloudinary, validation
- `scripts/` - Utility scripts (admin creation)

## Key Features

- MVC architecture
- JWT authentication
- OTP-based registration
- Admin approval system
- Multi-passenger booking
- Custom trip requests
- Role-based access control
- Email notifications
- Image uploads (Cloudinary)
