// Analytics Configuration for FinGuard
// This file contains configuration settings for Expo Insights

export const analyticsConfig = {
  // Enable analytics in development mode (set to false for production)
  enableInDevelopment: true,
  
  // Enable analytics in production
  enableInProduction: true,
  
  // Automatic screen tracking
  autoTrackScreens: true,
  
  // Track app lifecycle events
  trackAppLifecycle: true,
  
  // Track errors automatically
  trackErrors: true,
  
  // Track performance metrics
  trackPerformance: true,
  
  // Custom event tracking settings
  customEvents: {
    // Track user interactions
    trackUserInteractions: true,
    
    // Track business-specific events
    trackBusinessEvents: true,
    
    // Track feature usage
    trackFeatureUsage: true,
  },
  
  // Data sampling (set to 1.0 for 100% sampling, 0.1 for 10%)
  sampleRate: 1.0,
  
  // Session configuration
  session: {
    // Session timeout in minutes
    timeout: 30,
    
    // Track session duration
    trackDuration: true,
  },
  
  // User identification
  user: {
    // Track user properties (non-PII only)
    trackUserProperties: true,
    
    // User ID tracking
    trackUserId: false, // Set to true if you want to track user IDs
  },
  
  // Privacy settings
  privacy: {
    // Anonymize IP addresses
    anonymizeIp: true,
    
    // Respect Do Not Track headers
    respectDoNotTrack: true,
    
    // Data retention period in days
    dataRetentionDays: 90,
  },
};

export default analyticsConfig;
