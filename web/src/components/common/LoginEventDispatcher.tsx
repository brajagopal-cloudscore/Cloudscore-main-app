import { useEffect } from 'react';

const LoginEventDispatcher: React.FC = () => {
  // Static behavior - simulate logged in state
  const isLoggedIn = true;
  
  useEffect(() => {
    if (isLoggedIn) {
      try {
        window.dispatchEvent(new Event('login-event'));
      } catch (e) {
        console.error("Failed to dispatch login event", e);
      }
      
      // Simulate inactivity timer reset
      console.log('Inactivity timer reset');
      
      localStorage.setItem('fresh-login', Date.now().toString());
    }
  }, [isLoggedIn]);
  
  return null;
};

export default LoginEventDispatcher;
