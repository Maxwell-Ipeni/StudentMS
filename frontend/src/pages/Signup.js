import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const Signup = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (!modal.classList.contains('show')) {
              navigate('/');
            }
          }
        });
      });
      
      observer.observe(modal, { attributes: true });
      return () => observer.disconnect();
    }
  }, [navigate]);
  
  return <AuthModal type="signup" show={true} onHide={() => navigate('/')} />;
};

export default Signup;