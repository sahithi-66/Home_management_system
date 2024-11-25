# Home Management System - Backend

This is the backend server for the Home Management System, a comprehensive solution for managing shared living spaces. It provides APIs for managing notices, expenses, chores, and grocery lists among roommates.

## Features

### 1. Common Notice Board
- Post and manage general announcements
- Track package deliveries
- Search functionality for notices
- Get notice history
- Mark notices as parcels for package tracking

### 2. Expense Management
- Track shared expenses
- Split bills among roommates
- Record payment history
- View who owes whom
- Generate expense reports

### 3. Chores Management
- Create and assign chores
- Track chore completion status
- Set recurring chores
- Dynamic schedule adjustments
- View chore history

### 4. Grocery List Management
- Maintain shared grocery lists
- Track item quantities
- Monitor stock levels
- Record purchase history
- Set low stock alerts

## Technologies Used

- Node.js
- Express.js
- MySQL
- Jest (Testing)
- JWT (Authentication - coming soon)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm (v6 or higher)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/sahithi-66/Home_management_system.git
cd Home_management_system
```

### 2. Install MySQL (if not already installed)

#### For Mac:
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

#### For Windows:
Download and install MySQL from the official website.

#### For Linux:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### 3. Set Up the Database
```bash
# Log into MySQL
mysql -u root -p

# Then run these commands in MySQL:
CREATE DATABASE home_management;
CREATE USER 'home_app'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON home_management.* TO 'home_app'@'localhost';
FLUSH PRIVILEGES;
exit;

# Import the schema (from project root)
mysql -u root -p home_management < backend/src/config/schema.sql
```

### 4. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=home_app
DB_PASS=your_password_here
DB_NAME=home_management
NODE_ENV=development
```

### 5. Install Dependencies
```bash
cd backend
npm install
```

### 6. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:3000

## API Documentation

### Notice Board Endpoints

#### Create a Notice
```http
POST /api/notices
Content-Type: application/json

{
  "title": "House Meeting",
  "content": "Meeting this Sunday at 6 PM",
  "author_id": 1,
  "is_parcel": false
}
```

#### Get All Notices
```http
GET /api/notices
```

#### Get Parcel Notices
```http
GET /api/notices/parcels
```

#### Search Notices
```http
GET /api/notices/search?term=meeting
```

[Additional endpoint documentation coming soon]

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Manual API Testing
You can use the provided test script:
```bash
node test-notices.js
```

Or use Postman/curl:
```bash
# Example: Create a notice
curl -X POST http://localhost:3000/api/notices \
-H "Content-Type: application/json" \
-d '{
  "title": "Test Notice",
  "content": "Test Content",
  "author_id": 1,
  "is_parcel": false
}'
```

## Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   ├── app.js         # Express app setup
│   └── server.js      # Server entry point
├── tests/             # Test files
├── .env              # Environment variables
└── package.json      # Project dependencies
```

## Common Issues and Solutions

### MySQL Connection Issues
If you get authentication errors:
```sql
ALTER USER 'home_app'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;
```

### Port Already in Use
Change the PORT in .env file or kill the process using the port:
```bash
lsof -i :3000
kill -9 <PID>
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Write/update tests
4. Create a pull request

## License