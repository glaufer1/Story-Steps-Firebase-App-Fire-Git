import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { AppUser } from '../interfaces';
import { db } from '../firebaseConfig';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'Admin' | 'Creator' | 'Customer'>('Admin');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'Admin' | 'Creator' | 'Customer'>('Customer');

    useEffect(() => {
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
        fetchUsers();
    }, []);

    const handleDeleteUser = async (uid: string) => {
        try {
            await deleteDoc(doc(db, "users", uid));
            setUsers(users.filter(user => user.uid !== uid));
        } catch (err) {
            setError('Failed to delete user.');
            console.error(err);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail || !newUserPassword) {
            setError('Please enter an email and password.');
            return;
        }
        setError('');
        try {
            const functions = getFunctions();
            const createUser = httpsCallable(functions, 'createUser');
            await createUser({ email: newUserEmail, password: newUserPassword, role: newUserRole });
            // Refresh user list after adding a new user
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as AppUser));
            setUsers(usersData);
            setNewUserEmail('');
            setNewUserPassword('');
        } catch (err) {
            setError('Failed to add user. ' + (err as Error).message);
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user => user.role === activeTab);

    if (loading) return <p>Loading users...</p>;

    return (
        <div className="user-management-container">
            <div className="add-user-form">
                <h3>Add New User</h3>
                <form onSubmit={handleAddUser}>
                    <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="User Email"
                    />
                    <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Temporary Password"
                    />
                    <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as 'Admin' | 'Creator' | 'Customer')}>
                        <option value="Customer">Customer</option>
                        <option value="Creator">Creator</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <button type="submit">Add User</button>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            <div className="user-tabs">
                <button onClick={() => setActiveTab('Admin')} className={activeTab === 'Admin' ? 'active' : ''}>Admins</button>
                <button onClick={() => setActiveTab('Creator')} className={activeTab === 'Creator' ? 'active' : ''}>Creators</button>
                <button onClick={() => setActiveTab('Customer')} className={activeTab === 'Customer' ? 'active' : ''}>Customers</button>
            </div>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>User ID (UID)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.uid}>
                            <td>{user.email}</td>
                            <td>{user.uid}</td>
                            <td>
                                <button onClick={() => handleDeleteUser(user.uid)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
