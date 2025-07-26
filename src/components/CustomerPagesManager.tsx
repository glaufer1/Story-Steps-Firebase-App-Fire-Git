import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CustomerPage, CustomerPageType, AppUser } from '../interfaces';
import ErrorMessage from './ErrorMessage';
import './CustomerPagesManager.css';

interface CustomerPagesManagerProps {
  user: AppUser;
}

const CustomerPagesManager: React.FC<CustomerPagesManagerProps> = ({ user }) => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<CustomerPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPage, setNewPage] = useState({
    title: '',
    type: CustomerPageType.Custom,
    description: ''
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'customerPages'));
      const pagesData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as CustomerPage));
      setPages(pagesData);
    } catch (err) {
      setError('Failed to fetch pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.title.trim()) {
      setError('Page title is required');
      return;
    }

    try {
      const slug = newPage.title.toLowerCase().replace(/\s+/g, '-');
      const pageData = {
        ...newPage,
        slug,
        isPublished: false,
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid
      };

      const docRef = await addDoc(collection(db, 'customerPages'), pageData);
      console.log('Page created with ID:', docRef.id);
      
      setShowAddForm(false);
      setNewPage({ title: '', type: CustomerPageType.Custom, description: '' });
      fetchPages();
    } catch (err) {
      setError('Failed to create page');
      console.error(err);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      await deleteDoc(doc(db, 'customerPages', pageId));
      fetchPages();
    } catch (err) {
      setError('Failed to delete page');
      console.error(err);
    }
  };

  const handleTogglePublish = async (page: CustomerPage) => {
    try {
      await updateDoc(doc(db, 'customerPages', page.id), {
        isPublished: !page.isPublished,
        updatedAt: new Date()
      });
      fetchPages();
    } catch (err) {
      setError('Failed to update page');
      console.error(err);
    }
  };

  const handleEditPage = (page: CustomerPage) => {
    navigate(`/admin/customer-page-editor/${page.id}`);
  };

  const handleViewPage = (page: CustomerPage) => {
    navigate(`/page/${page.slug}`);
  };

  if (loading) return <div className="loading">Loading pages...</div>;

  return (
    <div className="customer-pages-manager">
      <div className="manager-header">
        <h2>Customer Facing Pages</h2>
        <button 
          className="add-page-button"
          onClick={() => setShowAddForm(true)}
        >
          Add Page
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {showAddForm && (
        <div className="add-page-form">
          <h3>Create New Page</h3>
          <form onSubmit={handleCreatePage}>
            <div className="form-group">
              <label>Page Title:</label>
              <input
                type="text"
                value={newPage.title}
                onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                placeholder="Enter page title"
                required
              />
            </div>

            <div className="form-group">
              <label>Page Type:</label>
              <select
                value={newPage.type}
                onChange={(e) => setNewPage({ ...newPage, type: e.target.value as CustomerPageType })}
              >
                <option value={CustomerPageType.Custom}>Custom Page</option>
                <option value={CustomerPageType.Home}>Home Page</option>
                <option value={CustomerPageType.About}>About Page</option>
                <option value={CustomerPageType.Blog}>Blog Page</option>
                <option value={CustomerPageType.City}>City Page</option>
                <option value={CustomerPageType.TourPromo}>Tour Promo Page</option>
                <option value={CustomerPageType.ToursList}>Tours List Page</option>
                <option value={CustomerPageType.Stop}>Stop Page</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={newPage.description}
                onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                placeholder="Enter page description"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">
                Create Page
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="pages-list">
        <table className="pages-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td>{page.type}</td>
                <td>
                  <span className={`status ${page.isPublished ? 'published' : 'draft'}`}>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>{page.createdAt?.toLocaleDateString()}</td>
                <td className="actions">
                  <button 
                    className="action-button edit"
                    onClick={() => handleEditPage(page)}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-button view"
                    onClick={() => handleViewPage(page)}
                  >
                    View
                  </button>
                  <button 
                    className="action-button toggle-publish"
                    onClick={() => handleTogglePublish(page)}
                  >
                    {page.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDeletePage(page.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages.length === 0 && (
          <div className="no-pages">
            <p>No customer pages found. Create your first page above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPagesManager; 