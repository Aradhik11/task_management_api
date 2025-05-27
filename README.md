# Task Management API

A RESTful API for task management built with Node.js, Express.js, TypeScript, PostgreSQL, and Sequelize.

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript**
- **PostgreSQL** with **Sequelize ORM**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Swagger** for API documentation
- **express-validator** for input validation

## Project Structure

```
task-management-api/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── swagger.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── taskController.ts
│   │   └── reportController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── models/
│   │   ├── index.ts
│   │   ├── User.ts
│   │   └── Task.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── taskRoutes.ts
│   │   └── reportRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   └── taskService.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE task_management;
```

4. Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

5. Run database migrations:
```bash
npm run db:sync
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`
API Documentation will be available at `http://localhost:3000/api-docs`