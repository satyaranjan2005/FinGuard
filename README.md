# FinGuard - Personal Finance Management App

A comprehensive React Native Expo application for managing personal finances on Android devices.

## Features

### 🏠 Dashboard / Overview
- Monthly income vs expenses comparison
- Savings summary with visual indicators
- Interactive charts (pie chart for category breakdown, bar chart for weekly trends)
- Quick action buttons for common tasks
- Recent transactions overview

### 💰 Transaction Management
- **Add Transactions**: Income or Expense with full details
- **Category Selection**: Pre-defined categories (Food, Travel, Rent, etc.)
- **Payment Modes**: Cash, UPI, Credit Card, Debit Card, Bank Transfer
- **Transaction Details**: Amount, Notes, Date & Time
- **Transaction History**: Complete transaction listing with filters

### 📊 Transaction History
- Filter by date, type (income/expense), and category
- Search functionality across transaction notes and categories
- Sort by date or amount (ascending/descending)
- Visual transaction cards with category icons and colors
- Long-press to delete transactions

### 🎯 Budget Management
- Set monthly category-wise budgets
- Real-time progress tracking (e.g., "60% of Food budget used")
- Visual progress bars with color-coded warnings
- Budget overview with total spending vs. budget
- Over-budget notifications and warnings

### 🏷️ Categories Management
- Add, edit, and delete custom categories
- Separate categories for income and expenses
- Custom icons and colors for easy recognition
- Visual category selection with icon previews
- Pre-defined categories with sensible defaults

### 🔐 Authentication & Security
- Email-based login/signup system
- Secure credential storage using Expo SecureStore
- Biometric authentication support (FaceID/TouchID)
- Optional biometric login for enhanced security
- Secure data persistence

### 📱 Modern UI/UX
- Beautiful, modern interface using NativeWind (Tailwind CSS)
- Responsive design for various screen sizes
- Intuitive bottom tab navigation
- Smooth animations and transitions
- Consistent design language throughout

## Technology Stack

- **React Native** with **Expo SDK 53**
- **JavaScript/JSX** for development
- **NativeWind** (Tailwind CSS for React Native) for styling
- **React Navigation** for navigation (Bottom Tabs + Stack)
- **Expo Vector Icons** for iconography
- **React Native Chart Kit** for data visualization
- **AsyncStorage** for local data persistence
- **Expo SecureStore** for secure credential storage
- **Expo Local Authentication** for biometric authentication

## Project Structure

```
FinGuard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.js        # Custom button component
│   │   ├── Card.js          # Card container component
│   │   ├── Input.js         # Form input component
│   │   ├── StatCard.js      # Statistics display component
│   │   └── index.js         # Component exports
│   ├── screens/             # Application screens
│   │   ├── DashboardScreen.js       # Main dashboard
│   │   ├── AddTransactionScreen.js  # Add new transactions
│   │   ├── TransactionHistoryScreen.js # Transaction history
│   │   ├── BudgetScreen.js          # Budget management
│   │   ├── CategoriesScreen.js      # Category management
│   │   └── AuthScreen.js            # Authentication
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.js  # Main navigation configuration
│   ├── services/            # Business logic and data services
│   │   ├── storageService.js # Data persistence service
│   │   └── authService.js   # Authentication service
│   └── utils/               # Utility functions and helpers
├── assets/                  # Images, fonts, and static assets
├── App.js                   # Main application component
├── global.css               # Global Tailwind CSS styles
├── tailwind.config.js       # Tailwind configuration
├── babel.config.js          # Babel configuration
├── metro.config.js          # Metro bundler configuration
└── package.json             # Dependencies and scripts
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FinGuard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Scan the QR code with Expo Go app (Android)
   - Or run `npx expo run:android` for development build

## Key Features in Detail

### Authentication Flow
- Secure registration and login system
- Biometric authentication integration
- Automatic login with stored credentials
- Secure data storage using Expo SecureStore

### Data Management
- Local data persistence using AsyncStorage
- Comprehensive CRUD operations for all entities
- Data validation and error handling
- Optimized data retrieval and filtering

### Financial Tracking
- Real-time budget tracking and alerts
- Comprehensive transaction categorization
- Visual spending analysis with charts
- Monthly and weekly spending patterns

### User Experience
- Intuitive navigation with bottom tabs
- Responsive design for various screen sizes
- Consistent visual design with custom components
- Smooth animations and user feedback

## Development Guidelines

- Use functional components with React hooks
- Follow React Native and Expo best practices
- Implement responsive design patterns
- Use modern JavaScript (ES6+) features
- Follow consistent naming conventions
- Include proper error handling and loading states
- Ensure accessibility support

## Security Features

- Encrypted credential storage
- Biometric authentication support
- Secure local data persistence
- Input validation and sanitization
- Error handling without exposing sensitive data

## Future Enhancements

- Cloud backup and synchronization
- Export functionality (PDF, CSV)
- Recurring transaction support
- Investment tracking
- Bill reminders and notifications
- Multiple currency support
- Social sharing features
- Advanced analytics and insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding guidelines
4. Test thoroughly on Android devices
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**FinGuard** - Your Personal Finance Guardian 🛡️💰
