// Environment detection utilities

export const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         import.meta.env.DEV;
};

export const isProduction = () => {
  return !isDevelopment();
};

export const getBaseURL = () => {
  if (isDevelopment()) {
    return '/';
  }
  
  // Production - check if in subdirectory
  const path = window.location.pathname;
  if (path.includes('/my-kids')) {
    return '/my-kids';
  }
  
  return '/';
};

export const getFullURL = (path = '') => {
  const base = getBaseURL();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (base === '/') {
    return `/${cleanPath}`;
  }
  
  return `${base}/${cleanPath}`;
};

// Debug info
export const debugInfo = () => {
  return {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    isDev: isDevelopment(),
    isProd: isProduction(),
    baseURL: getBaseURL(),
    fullURL: getFullURL()
  };
};

// Console log debug info in development
if (isDevelopment()) {
  console.log('🔍 Environment Debug Info:', debugInfo());
}
