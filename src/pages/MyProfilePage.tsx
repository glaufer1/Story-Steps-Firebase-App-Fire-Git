import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { AppUser } from '../interfaces';
import CustomerHeader from '../components/CustomerHeader';
import FileUpload from '../components/FileUpload';
import './MyProfilePage.css';

interface MyProfilePageProps {
  user: AppUser;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  mobilePhone: string;
  citiesOfInterest: string[];
  photoURL: string;
}

const MyProfilePage: React.FC<MyProfilePageProps> = ({ user }) => {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    mobilePhone: '',
    citiesOfInterest: ['', '', ''],
    photoURL: user.photoURL || '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as ProfileData;
          setProfile({
            ...userData,
            citiesOfInterest: userData.citiesOfInterest || ['', '', ''],
            photoURL: userData.photoURL || user.photoURL || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handlePhotoUpload = async (url: string) => {
    try {
      setLoading(true);
      setError('');

      // Update profile with new photo URL
      handleInputChange('photoURL', url);
      setSuccess('Photo uploaded successfully');
    } catch (err) {
      console.error('Error updating profile photo:', err);
      setError('Failed to update profile photo');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePasswordChange = async () => {
    if (!auth.currentUser) return;
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updatePassword(auth.currentUser, newPassword);
      setSuccess('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password. You may need to sign in again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      await updateDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: new Date(),
      });

      setSuccess('Profile updated successfully');
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="my-profile-page">
      <CustomerHeader user={user} />
      
      <main className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || loading}
          >
            Save Changes
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-sections">
          <section className="photo-section">
            <div className="photo-container">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="profile-photo" />
              ) : (
                <div className="photo-placeholder">
                  <span>{user.email?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <FileUpload
                userId={user.uid}
                fileType="image"
                context="profile"
                maxSizeMB={5}
                onUploadSuccess={handlePhotoUpload}
                onUploadError={handlePhotoUploadError}
                buttonText="Upload Photo"
                acceptedFileTypes="image/*"
                className="profile-photo-upload"
              />
            </div>
          </section>

          <section className="account-section">
            <h2>Account Information</h2>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="disabled-input"
              />
              <small>Email address cannot be changed</small>
            </div>

            <div className="password-section">
              <h3>Change Password</h3>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <button 
                className="change-password-button"
                onClick={handlePasswordChange}
                disabled={!newPassword || !confirmPassword || loading}
              >
                Update Password
              </button>
            </div>
          </section>

          <section className="personal-info-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  type="text"
                  value={profile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  id="zipCode"
                  type="text"
                  value={profile.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mobilePhone">Mobile Phone</label>
              <input
                id="mobilePhone"
                type="tel"
                value={profile.mobilePhone}
                onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                placeholder="Enter mobile phone number"
              />
            </div>
          </section>

          <section className="cities-section">
            <h2>Cities of Interest</h2>
            <div className="cities-container">
              {profile.citiesOfInterest.map((city, index) => (
                <div key={index} className="form-group">
                  <label htmlFor={`city${index + 1}`}>City {index + 1}</label>
                  <input
                    id={`city${index + 1}`}
                    type="text"
                    value={city}
                    onChange={(e) => {
                      const newCities = [...profile.citiesOfInterest];
                      newCities[index] = e.target.value;
                      handleInputChange('citiesOfInterest', newCities);
                    }}
                    placeholder={`Enter city ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MyProfilePage;
