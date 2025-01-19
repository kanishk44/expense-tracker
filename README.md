# Expense Tracker

A full-stack web application for tracking personal expenses. Built with Node.js, Express, MySQL, and Bootstrap.

## Features

- Create, read, update, and delete expenses with an intuitive interface that makes managing your finances effortless
- Responsive design provides a seamless experience across desktop, tablet, and mobile devices
- Real-time updates ensure your expense data stays synchronized without requiring page refreshes
- Clean, modern user interface makes expense tracking simple and efficient
- Secure data persistence using MySQL database with Sequelize ORM integration

## Tech Stack

### Frontend

- HTML5 for structured, semantic markup
- Bootstrap 5.3 for responsive layout and components
- Bootstrap Icons for consistent visual elements
- Vanilla JavaScript for dynamic client-side interactions

### Backend

- Node.js runtime environment
- Express.js web application framework
- Sequelize ORM for database management
- MySQL database for reliable data storage

## Prerequisites

Ensure you have the following installed before running the application:

- Node.js (version 14 or higher)
- MySQL Server (running instance)
- MySQL credentials (defaults: username: 'root', password: 'Pass@123')

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Navigate to the project directory:

```bash
cd expense-tracker
```

3. Install dependencies:

```bash
npm install
```

4. Create the MySQL database:

```sql
CREATE DATABASE expense_tracker;
```

5. Start the server:

```bash
npm start
```

## API Endpoints

The application provides the following RESTful endpoints:

- **GET /api/expenses**

  - Retrieves all expenses
  - Returns an array of expense objects

- **POST /api/expenses**

  - Creates a new expense
  - Requires request body with expense details

- **PUT /api/expenses/:id**

  - Updates an existing expense
  - Requires expense ID and updated details

- **DELETE /api/expenses/:id**
  - Removes an expense from the database
  - Requires expense ID

## Environment Variables

Configure your database connection with these settings:

```env
DB_NAME=node-complete
DB_USER=root
DB_PASSWORD=<Your_Password>
DB_HOST=localhost
DB_DIALECT=mysql
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch:

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:

```bash
git commit -m 'Add some AmazingFeature'
```

4. Push to the branch:

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Bootstrap team for their excellent UI framework
- Sequelize team for their powerful ORM
- Express.js team for their robust web framework
