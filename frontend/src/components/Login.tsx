import { useEffect } from 'react';

interface LoginProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleLogin: () => void;
  handleMenuClick: (value: string) => void;
  errorMessage: string;
  setCurrentView: (value: string) => void;
}

const Login = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  handleMenuClick,
  errorMessage,
  setCurrentView
}: LoginProps) => {
  useEffect(() => {
    setCurrentView('/login');
    document.title = "Login";
  }, [setCurrentView]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-title">Login</div>
      
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>Email:</span>
          <input 
            type="text" 
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
        
        <div className="all-login-buttons">
          <button className="login-button" type="submit">Login</button>
          <button 
            className="register-login-button" 
            type="button"
            onClick={() => handleMenuClick('register')}
          >
            Register
          </button>
          <button 
            className="cancel-login-button" 
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

export default Login;