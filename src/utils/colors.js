// FinGuard App Color Palette
// Modern, accessible color scheme for financial app

export const colors = {
  // Primary Colors
  primary: {
    main: '#4f46e5',      // Indigo - Budget Screen
    light: '#7c3aed',     // Purple accent
  },
  
  // Secondary Colors
  secondary: {
    cyan: '#06b6d4',      // Cyan - Categories Screen
    cyanDark: '#0891b2',
  },
  
  // Status Colors
  success: {
    main: '#059669',      // Green - Income, HomeScreen
    dark: '#047857',
  },
  
  warning: {
    main: '#f59e0b',      // Amber - Transaction History
    dark: '#d97706',
  },
  
  danger: {
    main: '#dc2626',      // Red - Expenses
    dark: '#b91c1c',
  },
  
  info: {
    main: '#1d4ed8',      // Blue - Balance cards, buttons
    dark: '#1e40af',
  },
  
  // Neutral Colors
  neutral: {
    50: '#f8fafc',        // Background
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Semantic Colors
  background: '#f8fafc',
  surface: '#ffffff',
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
    // Gradient Combinations
  gradients: {
    budget: ['#4f46e5', '#7c3aed'],
    categories: ['#06b6d4', '#0891b2'],
    transactions: ['#f59e0b', '#d97706'],
    home: ['#10b981', '#059669'],
    income: ['#059669', '#047857'],
    expense: ['#dc2626', '#b91c1c'],
    balance: ['#1d4ed8', '#1e40af'],
    goals: ['#8b5cf6', '#6366f1'],
  }
};

export default colors;
