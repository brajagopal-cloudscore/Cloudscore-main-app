import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import config from '../config/config';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { trackAPIStart, trackAPIComplete, trackAPIWithData, trackAPIError } from '../lib/api-tracking';

const BASE_URL = config.NEXT_PUBLIC_BASE_URL;

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _preventRetry?: boolean;
  metadata?: { trackingId?: string };
}

const instanceAxios = axios.create({
  baseURL: BASE_URL,
});

const isServer = typeof window === 'undefined';

let failedQueue: any[] = [];
let isRefreshing = false;
let isLoggingOut = false;
let currentAccessToken: string | null = null;

// Initialize the token from storage on startup
if (!isServer) {
  currentAccessToken = localStorage.getItem('accessToken') || getCookie('accessToken') || null;
} else {
  currentAccessToken = getCookie('accessToken') || null;
}

const processQueue = (error: any = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

// Function to check if error is network-related
const isNetworkError = (error: any): boolean => {
  if (axios.isCancel(error)) {
    return false;
  }
  
  if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError' || error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK' || error?.message?.includes('timeout') || error?.message?.includes('Network Error')) {
    return false;
  }
  
  const isNetworkIssue = (
    !navigator.onLine ||
    error.code === 'ERR_INTERNET_DISCONNECTED'
  );
  
  return isNetworkIssue;
};

// Function to redirect to network error page
const redirectToNetworkError = () => {
  if (!isServer) {
    sessionStorage.setItem('networkErrorReturnUrl', window.location.pathname);
    window.location.href = '/network-error';
  }
};

// Function to clear auth data without redirecting
const clearAuthData = () => {
  if (!isServer) {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("auth");
      channel.postMessage({ type: "LOGOUT" });
      channel.close();
    }
    localStorage.setItem("logout-event", Date.now().toString());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('project-tab');
    localStorage.removeItem('selectedModel');
    localStorage.removeItem('selectedProject');
    localStorage.removeItem('selectedLLMModel');
    localStorage.removeItem('logout-event');
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('userRole');
    currentAccessToken = null;
  } else {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('userRole');
    currentAccessToken = null;
  }
};

// Function to handle logout with optional redirect
const handleLogout = async (shouldRedirect: boolean = false) => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    if (!isServer) {
      clearAuthData();
      
      // Only redirect if explicitly requested
      if (shouldRedirect) {
        window.location.href = '/sign-in';
      }
    } else {
      clearAuthData();
    }
  } catch (error) {
    clearAuthData();
    if (shouldRedirect && !isServer) {
      window.location.href = '/sign-in';
    }
  } finally {
    isLoggingOut = false;
  }
};

// Function to update tokens consistently across storage mechanisms
const updateTokens = (access: string, refresh: string) => {
  currentAccessToken = access;
  
  if (!isServer) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
  
  setCookie('accessToken', access);
  setCookie('refreshToken', refresh);
  
  instanceAxios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
};

// Get the most recent token
const getAccessToken = () => {
  if (!isServer) {
    return localStorage.getItem('accessToken') || getCookie('accessToken') || currentAccessToken;
  }
  return getCookie('accessToken') || currentAccessToken;
};

// Monitor network status (client-side only)
if (!isServer) {
  window.addEventListener('offline', () => {
    redirectToNetworkError();
  });

  window.addEventListener('online', () => {
    const returnUrl = sessionStorage.getItem('networkErrorReturnUrl');
    if (returnUrl && window.location.pathname === '/network-error') {
      sessionStorage.removeItem('networkErrorReturnUrl');
      window.location.href = returnUrl;
    }
  });
}

instanceAxios.interceptors.request.use((req: RetryConfig) => {
  if (isLoggingOut) {
    req._preventRetry = true;
  }

  if (!isServer && !navigator.onLine) {
    redirectToNetworkError();
    return Promise.reject(new Error('No internet connection'));
  }

  // Always use the most up-to-date token
  const token = getAccessToken();
  
  if (!req.headers.Authorization && token && !req.headers.noAuth) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // Start API tracking for this request
  const method = req.method || 'GET'
  const url = req.url || ''
  const trackingId = trackAPIStart(method, url, {
    includeTenantId: true,
    includeUserId: true
  })

  // Store tracking ID in config for response interceptor
  req.metadata = { ...req.metadata, trackingId }

  // Track request data size if present
  if (req.data) {
    trackAPIWithData(trackingId, req.data, {
      trackRequestSize: true
    })
  }

  return req;
}, (error) => {
  // Track request error
  trackAPIError(error.config?.method || 'UNKNOWN', error.config?.url || '', error, {
    includeTenantId: true,
    includeUserId: true
  })
  return Promise.reject(error);
});

instanceAxios.interceptors.response.use(
  (response) => {
    // Track successful response
    const trackingId = (response.config as RetryConfig).metadata?.trackingId
    if (trackingId) {
      trackAPIComplete(trackingId, response.status, response, undefined, {
        trackResponseSize: true,
        includeTenantId: true,
        includeUserId: true
      })
    }
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config as RetryConfig;
    
    // Track error response
    const trackingId = originalRequest?.metadata?.trackingId
    if (trackingId) {
      const statusCode = error.response?.status || 0
      trackAPIComplete(trackingId, statusCode, error.response, error, {
        trackResponseSize: true,
        includeTenantId: true,
        includeUserId: true
      })
    }
    
    // Also track as error event
    trackAPIError(originalRequest?.method || 'UNKNOWN', originalRequest?.url || '', error, {
      includeTenantId: true,
      includeUserId: true
    })
    
    if (isNetworkError(error)) {
      redirectToNetworkError();
      return Promise.reject(new Error('Network connection failed. Please check your internet connection.'));
    }

    if (axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      return Promise.reject(error);
    }

    if (isLoggingOut || originalRequest?._preventRetry) {
      return Promise.reject(error);
    }

    // Only attempt refresh once for a given request
    if (error.response?.status === 401 && !originalRequest?._retry) { 
      originalRequest._retry = true;
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`;
            return instanceAxios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = !isServer ? 
          localStorage.getItem('refreshToken') || getCookie('refreshToken') : 
          getCookie('refreshToken');
          
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${config.NEXT_PUBLIC_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh } = response?.data || {};
        
        if (!access || !refresh) {
          throw new Error('Invalid token response');
        }

        // Update tokens consistently
        updateTokens(access, refresh);
        
        // Update the current request's Authorization header
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        processQueue();
        return instanceAxios(originalRequest);
      } catch (refreshError) {
        if (refreshError instanceof Error && isNetworkError(refreshError as AxiosError)) {
          redirectToNetworkError();
          return Promise.reject(new Error('Network connection failed during token refresh.'));
        }
        
        processQueue(refreshError);
        
        // Clear auth data but DON'T redirect - let the UI handle it
        clearAuthData();
        
        return Promise.reject(new Error('Authentication failed. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instanceAxios;
