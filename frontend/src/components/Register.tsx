import { useEffect } from 'react';
import { AuthProps } from '../types';

interface RegisterProps extends AuthProps {
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  handleRegister: () => void;
}

const Register = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleRegister,
  handleMenuClick,
  errorMessage,
  setCurrentView
}: RegisterProps) => {
  useEffect(() => {
    setCurrentView('/register');
    document.title = "Register";
  }, [setCurrentView]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleRegister();
  };

  return (
    <div className="register-container">
      <div className="register-title">Register Account</div>
      
      <form className="register-form" onSubmit={handleSubmit}>
        <label>
          <span>Email:</span>
          <input 
            type="email" 
            name="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </label>
        
        <label>
          <span>Password:</span>
          <input 
            type="password" 
            name="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </label>
        
        <label>
          <span>Confirm Password:</span>
          <input 
            type="password" 
            name="confirmPassword" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
        </label>
        
        <div className="all-register-buttons">
          <button className="register-button" type="submit">Register</button>
          <button 
            className="login-register-button" 
            type="button" 
            onClick={() => handleMenuClick('login')}
          >
            Login
          </button>
          <button 
            className="cancel-register-button" 
            type="button" 
            onClick={() => handleMenuClick('')}
          >
            Cancel
          </button>
        </div>
        
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default Register;