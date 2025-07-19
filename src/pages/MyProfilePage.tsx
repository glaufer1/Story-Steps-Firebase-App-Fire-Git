import React from 'react';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import './PageStyles.css';

const MyProfilePage: React.FC = () => {
    
    const handleLogout = () => {
        signOut(auth).catch(error => {
            console.error("Logout Error:", error);
        });
    };

    return (
        <div className="page-container">
            <h1>My Profile</h1>
            <p>This page will contain profile settings.</p>
            <button onClick={handleLogout} className="purchase-btn">
                Logout
            </button>
        </div>
    );
};

export default MyProfilePage;
