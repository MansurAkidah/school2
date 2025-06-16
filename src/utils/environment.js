export const getEnvironment = () => {
    // Try to access window object safely
    if (typeof window === 'undefined') {
      return 'server';
    }
    
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    
    if (hostname.includes('ngrok')) {
      return 'ngrok';
    }
    
    return 'production';
  };
  
  export const getApiUrl = () => {
    const env = getEnvironment();
    
    switch (env) {
      case 'development':
        return 'http://localhost:5000';
      case 'ngrok':
      case 'production':
        return `${window.location.protocol}//${window.location.host}`;
      default:
        return 'http://localhost:5000';
    }
  };