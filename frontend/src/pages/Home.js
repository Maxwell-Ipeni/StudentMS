import React, { useState, useEffect } from 'react';
import AuthModal from '../components/AuthModal';

const backgroundImage = '/images/background.png';

const Home = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState('login');

  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      setAuthModalType(event.detail.type);
      setShowAuthModal(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal);
  }, []);

  const handleLoginClick = () => {
    setAuthModalType('login');
    setShowAuthModal(true);
  };

  const handleSignupClick = () => {
    setAuthModalType('signup');
    setShowAuthModal(true);
  };

  return (
    <div 
      className="landing-page"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}
    >
      <div className="landing-header">
        <button 
          className="btn btn-login"
          onClick={handleLoginClick}
        >
          Login
        </button>
        <button 
          className="btn btn-signup"
          onClick={handleSignupClick}
        >
          Sign Up
        </button>
      </div>

      <AuthModal 
        type={authModalType}
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Home;