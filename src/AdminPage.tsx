import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { AppUser } from './interfaces';
import { db } from './firebaseConfig';
import './pages/PageStyles.css'; // Assuming you have some shared styles here

const AdminPage = () => {
    // State to hold the list of users
    const [users, setUsers] = useState<AppUser[]>([]);
    // State for loading and error messages for better UX
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // This function fetches all documents from the 'users' collection in Firestore
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            // We map over the documents, combining the document ID (the UID) with the data
            const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as AppUser));
            setUsers(usersData);
        } catch (err) {
            setError('Failed to fetch users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // This runs the fetchUsers function once when the component first loads
    useEffect(() => {
        fetchUsers();
    }, []);

    // This function is called when an Admin changes a role in the dropdown
    const handleRoleChange = async (uid: string, newRole: 'Admin' | 'Creator' | 'Customer') => {
        const userRef = doc(db, "users", uid);
        try {
            // Update the 'role' field in the specific user's document
            await updateDoc(userRef, { role: newRole });
            
            // To make the UI update instantly, we can either re-fetch all users
            // or just update the role in our local state. The latter is faster.
            setUsers(currentUsers =>
                currentUsers.map(user =>
                    user.uid === uid ? { ...user, role: newRole } : user
                )
            );

        } catch (err) {
            setError('Failed to update role.');
            console.error(err);
        }
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="page-list-container">
            <h2>User Management</h2>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>User ID (UID)</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.uid}>
                            <td>{user.email}</td>
                            <td>
                                <select 
                                    value={user.role} 
                                    onChange={(e) => handleRoleChange(user.uid, e.target.value as 'Admin' | 'Creator' | 'Customer')}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Creator">Creator</option>
                                    <option value="Customer">Customer</option>
                                </select>
                            </td>
                            <td>{user.uid}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPage;