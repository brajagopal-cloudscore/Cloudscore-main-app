'use client';
import React, { useEffect, useState } from 'react';
import CustomErrorPage from '@/components/error/CustomErrorPage';

export default function NetworkError() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial network status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Redirect back to the previous page if available
      const returnUrl = sessionStorage.getItem('networkErrorReturnUrl');
      if (returnUrl) {
        sessionStorage.removeItem('networkErrorReturnUrl');
        window.location.href = returnUrl;
      } else {
        window.location.href = '/projects'; // Default redirect
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      // Try to go back to the previous page
      const returnUrl = sessionStorage.getItem('networkErrorReturnUrl');
      if (returnUrl) {
        sessionStorage.removeItem('networkErrorReturnUrl');
        window.location.href = returnUrl;
      } else {
        window.location.reload();
      }
    } else {
      // Still offline, just reload the page to check again
      window.location.reload();
    }
  };

  return (
    <CustomErrorPage
      type="network"
      title={isOnline ? "Connection Restored" : "Connection Error"}
      message={
        isOnline
          ? "Your internet connection has been restored. Redirecting..."
          : "Unable to connect to the server. Please check your internet connection and try again."
      }
      buttonText={isOnline ? "Redirecting..." : "Try Again"}
      onButtonClick={handleRetry}
      showButton={true}
    />
  );
}
