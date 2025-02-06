# Expense Tracker

A modern full-stack expense management solution built with Node.js, Express, MongoDB, and Bootstrap. Track your personal finances with ease through an intuitive and responsive interface.

## Key Features

Experience seamless expense tracking with:

- Intuitive CRUD operations for managing all your financial transactions
- Responsive design that works beautifully across all devices
- Real-time updates without page refreshes
- Modern, clean interface focused on efficiency
- Secure MongoDB data storage with Mongoose ODM
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
- MongoDB with Mongoose ODM
- AWS S3 storage
- Razorpay payments
- JWT for authentication

## Getting Started

### System Requirements

- Node.js v14+
- MongoDB Atlas account or local MongoDB installation
- AWS account for S3 storage
- Razorpay account for payments

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

3. Create `.env` configuration:

   ```env
   MONGO_URL=your_mongodb_connection_string
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

4. Launch the application:
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

## Data Models

### User Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  isPremium: Boolean,
  totalExpenses: Number
}
```

### Expense Schema

```javascript
{
  description: String,
  amount: Number,
  category: String,
  type: String,
  userId: ObjectId,
  date: Date
}
```

### Order Schema

```javascript
{
  orderId: String,
  paymentId: String,
  status: String,
  amount: Number,
  userId: ObjectId
}
```

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

- MongoDB team
- Mongoose team
- Express.js team
- Bootstrap team
- Razorpay
- AWS
