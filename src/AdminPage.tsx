import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import type { AppUser } from './interfaces';
import { db } from './firebaseConfig';

const AdminPage = () => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as AppUser));
            setUsers(usersData);
        } catch (err) {
            setError('Failed to fetch users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (uid: string, newRole: 'Admin' | 'Creator' | 'Customer') => {
        const userRef = doc(db, "users", uid);
        try {
            await updateDoc(userRef, { role: newRole });
            // Refresh users to show the updated role
            fetchUsers();
        } catch (err) {
            setError('Failed to update role.');
            console.error(err);
        }
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>User Management</h2>
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.uid}>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPage;
