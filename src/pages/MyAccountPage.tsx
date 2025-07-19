import React from 'react';
import type { AppUser } from '../interfaces';
import './PageStyles.css';

interface MyAccountPageProps {
    user: AppUser;
}

const MyAccountPage: React.FC<MyAccountPageProps> = ({ user }) => {
    // We will add state and handlers for these fields later
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [allowSms, setAllowSms] = React.useState(false);
    const [address, setAddress] = React.useState('');
    const [city, setCity] = React.useState('');
    const [state, setState] = React.useState('');
    const [zip, setZip] = React.useState('');

    return (
        <div className="page-container">
            <h1>My Account</h1>
            <p>Welcome, {user.email}!</p>
            
            <form className="profile-form">
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={user.email || ''} disabled />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user.email || ''} disabled />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div className="form-group checkbox-group">
                    <input type="checkbox" id="sms-approval" checked={allowSms} onChange={(e) => setAllowSms(e.target.checked)} />
                    <label htmlFor="sms-approval">Approve the use of your Phone number for account maintenance (e.g., password resets).</label>
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label>City</label>
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>State</label>
                        <input type="text" value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Zip Code</label>
                        <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} />
                    </div>
                </div>
                <button type="submit" className="purchase-btn">Save Changes</button>
            </form>
        </div>
    );
};

export default MyAccountPage;
