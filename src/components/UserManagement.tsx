import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import type { AppUser } from '../interfaces';
import * as yup from 'yup';
import * as XLSX from 'xlsx';
import './UserManagement.css';

// Role descriptions are now handled in the UI directly

const userSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  role: yup.string().oneOf(['Admin', 'Creator', 'Customer'], 'Invalid role').required('Role is required'),
});

interface UserManagementProps {
  currentUser: AppUser;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  lastDoc: any;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Admin' | 'Creator' | 'Customer'>('Admin');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    mobilePhone: '',
    citiesOfInterest: ['', '', ''],
    role: 'Customer' as 'Admin' | 'Creator' | 'Customer'
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 50,
    totalUsers: 0,
    lastDoc: null
  });

  // Access Control - Only Administrators can access
  if (currentUser.role !== 'Admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only Administrators can access User Management.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, [activeTab, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const usersCollection = collection(db, 'users');
      
      console.log('Fetching users for role:', activeTab);
      
      // First, try to get all users to see what's in the database
      const allUsersQuery = query(usersCollection, orderBy('createdAt', 'desc'));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      console.log('Total users in database:', allUsersSnapshot.size);
      
      if (allUsersSnapshot.size === 0) {
        console.log('No users found in database. This might indicate:');
        console.log('1. Users are not being created properly');
        console.log('2. Users are being created in a different collection');
        console.log('3. There are permission issues');
      }
      
      const allUsers = allUsersSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('User data:', { uid: doc.id, ...data });
        return {
          ...data,
          uid: doc.id,
          role: data.role || 'Customer',
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
        };
      }) as AppUser[];
      
      // Filter by role
      const filteredUsers = allUsers.filter(user => user.role === activeTab);
      console.log(`Users with role ${activeTab}:`, filteredUsers.length);
      
      setUsers(filteredUsers);
      setPagination(prev => ({
        ...prev,
        totalUsers: filteredUsers.length,
        lastDoc: null
      }));
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'Admin' | 'Creator' | 'Customer') => {
    setValidationErrors([]);
    setError('');
    setSelectedUser(userId);

    const user = users.find(u => u.uid === userId);
    if (!user) return;

    try {
      const updateUserRole = httpsCallable(functions, 'updateUserRole');
      await updateUserRole({ uid: userId, role: newRole });
      
      // Update local state
      setUsers(users.map(u => 
        u.uid === userId ? { ...u, role: newRole } : u
      ));
      
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleAddUser = async () => {
    setValidationErrors([]);
    setError('');

    try {
      await userSchema.validate(newUser, { abortEarly: false });
      
      console.log('Creating user with data:', newUser);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      console.log('User created in Auth with UID:', userCredential.user.uid);

      // Set the role via Cloud Function
      try {
        const updateUserRole = httpsCallable(functions, 'updateUserRole');
        await updateUserRole({ 
          uid: userCredential.user.uid, 
          role: activeTab 
        });
        console.log('Role set via Cloud Function');
      } catch (roleError) {
        console.error('Error setting role:', roleError);
        // Continue anyway, we'll set the role in Firestore
      }

      // Add user to Firestore
      const userData = {
        uid: userCredential.user.uid,
        email: newUser.email,
        role: activeTab, // Use the active tab role
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        address: newUser.address,
        city: newUser.city,
        state: newUser.state,
        zipCode: newUser.zipCode,
        mobilePhone: newUser.mobilePhone,
        citiesOfInterest: newUser.citiesOfInterest.filter(city => city.trim() !== ''),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Saving user data to Firestore:', userData);

      // Use setDoc with the UID as the document ID to ensure consistency
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      console.log('User saved to Firestore successfully');

      // Reset form and refresh users
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        mobilePhone: '',
        citiesOfInterest: ['', '', ''],
        role: 'Customer'
      });
      setShowAddUserForm(false);
      
      // Refresh the user list
      await fetchUsers();
      
      console.log('User creation completed successfully');
    } catch (err: any) {
      console.error('Error creating user:', err);
      if (err.errors) {
        setValidationErrors(err.errors);
      } else {
        setError(err.message || 'Failed to create user');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Remove from local state
      setUsers(users.filter(u => u.uid !== userId));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const exportToExcel = (role: string) => {
    const roleUsers = users.filter(user => user.role === role);
    
    const worksheet = XLSX.utils.json_to_sheet(roleUsers.map(user => ({
      'First Name': user.firstName || '',
      'Last Name': user.lastName || '',
      'Email': user.email || '',
      'Address': user.address || '',
      'City': user.city || '',
      'State': user.state || '',
      'ZIP Code': user.zipCode || '',
      'Phone Number': user.mobilePhone || '',
      'City of Interest #1': user.citiesOfInterest?.[0] || '',
      'City of Interest #2': user.citiesOfInterest?.[1] || '',
      'City of Interest #3': user.citiesOfInterest?.[2] || '',
      'Role': user.role,
      'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      'Updated At': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : ''
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${role}s`);
    
    XLSX.writeFile(workbook, `${role}s_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management">
      <h2>User Management</h2>
      
      {/* Role-based Tabs */}
      <div className="role-tabs">
        <button 
          className={`tab-button ${activeTab === 'Admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('Admin')}
        >
          Administrators
        </button>
        <button 
          className={`tab-button ${activeTab === 'Creator' ? 'active' : ''}`}
          onClick={() => setActiveTab('Creator')}
        >
          Creators
        </button>
        <button 
          className={`tab-button ${activeTab === 'Customer' ? 'active' : ''}`}
          onClick={() => setActiveTab('Customer')}
        >
          Customers
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <div className="tab-header">
          <button 
            className="add-user-button"
            onClick={() => setShowAddUserForm(true)}
          >
            Add {activeTab}
          </button>
          <button 
            className="export-button"
            onClick={() => exportToExcel(activeTab)}
          >
            Download {activeTab === 'Admin' ? 'Administrators' : activeTab === 'Creator' ? 'Creators' : 'All Customers'}
          </button>

        </div>

        {/* User Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>ZIP Code</th>
                <th>Phone Number</th>
                <th>City of Interest #1</th>
                <th>City of Interest #2</th>
                <th>City of Interest #3</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.uid} className={selectedUser === user.uid ? 'selected' : ''}>
                  <td>{user.firstName || ''}</td>
                  <td>{user.lastName || ''}</td>
                  <td>{user.email}</td>
                  <td>{user.address || ''}</td>
                  <td>{user.city || ''}</td>
                  <td>{user.state || ''}</td>
                  <td>{user.zipCode || ''}</td>
                  <td>{user.mobilePhone || ''}</td>
                  <td>{user.citiesOfInterest?.[0] || ''}</td>
                  <td>{user.citiesOfInterest?.[1] || ''}</td>
                  <td>{user.citiesOfInterest?.[2] || ''}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value as 'Admin' | 'Creator' | 'Customer')}
                      disabled={selectedUser === user.uid}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Creator">Creator</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteUser(user.uid)}
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalUsers > pagination.pageSize && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage === 1}
            >
              « First
            </button>
            <button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              ‹ Prev
            </button>
            <span className="page-info">
              Page {pagination.currentPage}
            </span>
            <button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.totalUsers < pagination.pageSize}
            >
              Next ›
            </button>
            <button 
              onClick={() => handlePageChange(Math.ceil(pagination.totalUsers / pagination.pageSize))}
              disabled={pagination.totalUsers < pagination.pageSize}
            >
              Last »
            </button>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New {activeTab}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={newUser.city}
                    onChange={(e) => setNewUser({...newUser, city: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={newUser.state}
                    onChange={(e) => setNewUser({...newUser, state: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    value={newUser.zipCode}
                    onChange={(e) => setNewUser({...newUser, zipCode: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={newUser.mobilePhone}
                  onChange={(e) => setNewUser({...newUser, mobilePhone: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Cities of Interest</label>
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`City ${index + 1}`}
                    value={newUser.citiesOfInterest[index]}
                    onChange={(e) => {
                      const updatedCities = [...newUser.citiesOfInterest];
                      updatedCities[index] = e.target.value;
                      setNewUser({...newUser, citiesOfInterest: updatedCities});
                    }}
                  />
                ))}
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'Admin' | 'Creator' | 'Customer'})}
                >
                  <option value="Customer">Customer</option>
                  <option value="Creator">Creator</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-button">
                  Create User
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowAddUserForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <p key={index} className="error">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
