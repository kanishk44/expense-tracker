# Expense Tracker

A modern full-stack expense management solution built with Node.js, Express, MySQL, and Bootstrap. Track your personal finances with ease through an intuitive and responsive interface.

## Key Features

Experience seamless expense tracking with:

- Intuitive CRUD operations for managing all your financial transactions
- Responsive design that works beautifully across all devices
- Real-time updates without page refreshes
- Modern, clean interface focused on efficiency
- Secure MySQL data storage with Sequelize ORM
- Premium features including expense reports and leaderboards

## Technology Foundation

Our carefully selected tech stack ensures reliability and performance:

### Frontend

- HTML5 for semantic structure
- Bootstrap 5.3 for responsive layouts
- Bootstrap Icons for consistent visuals
- Pure JavaScript for dynamic interactions

### Backend

- Node.js environment
- Express.js framework
- Sequelize ORM
- MySQL database
- AWS S3 storage
- Razorpay payments

## Getting Started

### System Requirements

- Node.js v14+
- MySQL Server
- Default MySQL credentials (username: 'root', password: 'Pass@123')

### Setup Instructions

1. Get the code:

   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. Install packages:

   ```bash
   npm install
   ```

3. Initialize database:

   ```sql
   CREATE DATABASE expense_tracker;
   ```

4. Create `.env` configuration:

   ```env
   DB_NAME=expense-tracker
   DB_USER=root
   DB_PASSWORD=<Your_Password>
   DB_HOST=localhost
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ACCESS_TOKEN_SECRET=your_access_token_secret
   MAILERSEND_API_KEY=your_mailersend_api_key
   APP_URL=http://localhost:3000
   PORT=3000
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_BUCKET_NAME=your_bucket_name
   AWS_REGION=your_region
   ```

5. Launch the application:
   ```bash
   npm start
   ```

## API Reference

### Authentication

- `POST /api/user/signup` - Register new users
- `POST /api/user/login` - Authenticate and receive token

### Expense Operations

- `GET /api/expenses` - Retrieve user expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Remove expense
- `GET /api/expenses/download` - Export expenses to CSV

### Premium Features

- `GET /api/premium/leaderboard` - View expense rankings

## Contributing

Help improve Expense Tracker:

1. Fork the repository
2. Create your branch:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. Commit changes:

   ```bash
   git commit -m 'Add YourFeature'
   ```

4. Push to branch:

   ```bash
   git push origin feature/YourFeature
   ```

5. Submit a Pull Request

## License

Licensed under the MIT License. See LICENSE file for details.

## Acknowledgments

Special thanks to:

- Bootstrap team
- Sequelize team
- Express.js team
- Razorpay
- AWS
