import { useEffect } from 'react';

interface AccountProps {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  handleChangeAccount: () => void;
  handleMenuClick: (arg: string) => void;
  errorMessage: string;
  setCurrentView: (view: string) => void;
}

const Account = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleChangeAccount,
  handleMenuClick,
  errorMessage,
  setCurrentView
}: AccountProps) => {
  useEffect(() => {
    setCurrentView('/account');
    document.title = "Account";
  }, [setCurrentView]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleChangeAccount();
  };

  return (
    <div className="account-container">
      <div className="account-title">Account</div>
      
      <form className="account-form" onSubmit={handleSubmit}>        
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
        
        <div className="all-account-buttons">
          <button 
            className="edit-account-button" 
            type="submit"
          >
            Edit Account
          </button>
          <button 
            className="cancel-account-button" 
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

export default Account;