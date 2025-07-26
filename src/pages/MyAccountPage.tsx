import React, { useState } from 'react';
import { getAuth, updatePassword, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AppUser } from '../interfaces';
import CustomerHeader from '../components/CustomerHeader';
import * as yup from 'yup';
import './MyAccountPage.css';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').optional(),
  passwordConfirm: yup.string()
    .test('passwords-match', 'Passwords must match', function(value) {
      return !this.parent.password || value === this.parent.password;
    })
    .optional(),
});

interface MyAccountPageProps {
  user: AppUser;
}

const MyAccountPage: React.FC<MyAccountPageProps> = ({ user }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setSuccess('');

    if (!currentUser) {
      setValidationErrors(['You must be logged in to update your account']);
      return;
    }

    try {
      await schema.validate({ email, password, passwordConfirm }, { abortEarly: false });

      // Update email if changed
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
        await updateDoc(doc(db, 'users', currentUser.uid), { email });
      }

      // Update password if provided
      if (password) {
        await updatePassword(currentUser, password);
      }

      setSuccess('Account updated successfully!');
      setPassword('');
      setPasswordConfirm('');
    } catch (validationErr: any) {
      setValidationErrors(validationErr.errors);
    }
  };

  if (!currentUser) {
    return <div>Please log in to access your account settings.</div>;
  }

  return (
    <div className="my-account-page">
      <CustomerHeader user={user} />
      
      <main className="account-content">
        <div className="account-container">
          <h2>My Account</h2>
          
          <form onSubmit={handleSubmit} className="my-account-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password (optional):</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">Confirm New Password:</label>
              <input
                type="password"
                id="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            {validationErrors.length > 0 && (
              <div className="validation-errors">
                {validationErrors.map((error, index) => (
                  <p key={index} className="error">{error}</p>
                ))}
              </div>
            )}

            {success && <p className="success">{success}</p>}

            <div className="form-actions">
              <button type="submit">Save Changes</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default MyAccountPage;
