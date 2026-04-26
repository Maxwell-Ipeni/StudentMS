import React, { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthModal = ({ type = 'login', show = false, onHide }) => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLogin = type === 'login';

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginData.username.trim() || !loginData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/login', loginData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        toast.success('Login successful!');
        onHide();
        navigate('/dashboard');
        window.location.reload();
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!signupData.full_name.trim() || !signupData.username.trim() || 
        !signupData.email.trim() || !signupData.password) {
      setError('All fields are required');
      return;
    }
    
    if (signupData.password !== signupData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/register', {
        full_name: signupData.full_name,
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        role: signupData.role
      });
      
      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        onHide();
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onHide();
    setTimeout(() => {
      const event = new CustomEvent('openAuthModal', { detail: { type: 'login' } });
      window.dispatchEvent(event);
    }, 300);
  };

  const handleSwitchToSignup = () => {
    onHide();
    setTimeout(() => {
      const event = new CustomEvent('openAuthModal', { detail: { type: 'signup' } });
      window.dispatchEvent(event);
    }, 300);
  };

  return (
    <Modal show={show} onHide={onHide} centered className="auth-modal">
      <Modal.Header closeButton className="border-0">
        <div className="text-center w-100 pt-3">
          <div className="auth-modal-icon mx-auto mb-3">
            <i className={isLogin ? "bi bi-person-check-fill" : "bi bi-person-plus-fill"}></i>
          </div>
          <Modal.Title className="fw-bold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Modal.Title>
          <p className="text-muted mb-0">
            {isLogin ? 'Sign in to your account' : 'Join the Student Management System'}
          </p>
        </div>
      </Modal.Header>
      
      <Modal.Body className="px-4 pb-4">
        {error && (
          <Alert variant="danger" className="mb-3 py-2">
            {error}
          </Alert>
        )}
        
        {isLogin ? (
          <Form onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username or Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-person"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    placeholder="Enter username or email"
                    required
                    disabled={loading}
                  />
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-lock"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                  <Button 
                    variant="link"
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </Button>
                </InputGroup>
              </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="text-center mt-3">
              <small className="text-muted">
                Don't have an account?{' '}
                <button type="button" className="btn btn-link p-0 border-0 text-decoration-none" onClick={handleSwitchToSignup}>
                  Sign up
                </button>
              </small>
            </div>
          </Form>
        ) : (
          <Form onSubmit={handleSignupSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-person-badge"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={signupData.full_name}
                  onChange={handleSignupChange}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-at"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="username"
                  value={signupData.username}
                  onChange={handleSignupChange}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                />
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-envelope"></i>
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={signupData.role}
                onChange={handleSignupChange}
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-lock"></i>
                </InputGroup.Text>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                />
                <Button 
                  variant="link"
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </Button>
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-lock-fill"></i>
                </InputGroup.Text>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={signupData.confirm_password}
                  onChange={handleSignupChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <Button 
                  variant="link"
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </Button>
              </InputGroup>
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
            
            <div className="text-center mt-3">
              <small className="text-muted">
                Already have an account?{' '}
                <button type="button" className="btn btn-link p-0 border-0 text-decoration-none" onClick={handleSwitchToLogin}>
                  Sign in
                </button>
              </small>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;