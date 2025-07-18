import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { AppUser, Page, StopPage } from '../interfaces';
import StopPageEditor from '../components/StopPageEditor/StopPageEditor'; // Import the editor

interface PageManagementProps {
    user: AppUser;
}

const PageManagement: React.FC<PageManagementProps> = ({ user }) => {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State to manage which view is active
    const [editingPage, setEditingPage] = useState<Page | null>(null);

    const fetchPages = async () => {
        setLoading(true);
        const db = getFirestore();
        try {
            const querySnapshot = await getDocs(collection(db, "pages"));
            const pagesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Page));
            setPages(pagesData);
        } catch (err) {
            setError('Failed to fetch pages.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleEdit = (page: Page) => {
        setEditingPage(page);
    };

    const handleSave = async (updatedPage: Page) => {
        if (!editingPage) return;
        setLoading(true);
        const db = getFirestore();
        const pageRef = doc(db, "pages", editingPage.id);
        try {
            await updateDoc(pageRef, { ...updatedPage });
            setEditingPage(null); // Return to the list view
            fetchPages(); // Refresh the data
        } catch (err) {
            setError('Failed to save page.');
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (pageId: string) => {
        const db = getFirestore();
        if (window.confirm("Are you sure you want to delete this page?")) {
            try {
                await deleteDoc(doc(db, "pages", pageId));
                fetchPages();
            } catch (err) {
                setError('Failed to delete page.');
            }
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    // If we are editing a StopPage, render the editor
    if (editingPage && editingPage.type === 'Stop') {
        return (
            <div>
                <button onClick={() => setEditingPage(null)}>&larr; Back to Page List</button>
                <StopPageEditor page={editingPage as StopPage} onSave={handleSave} />
            </div>
        );
    }
    
    // TODO: Add editors for other page types here...

    // Default view: list of all pages
    return (
        <div className="page-list-container">
            <h2>Page Management</h2>
            {/* We can add a simplified "Create Page" form back here later */}
            <ul className="page-list">
                {pages.map(page => (
                    <li key={page.id} className="page-list-item">
                        <span>{page.title} <strong>({page.type})</strong></span>
                        <div className="page-actions">
                            <button className="edit-btn" onClick={() => handleEdit(page)}>Edit</button>
                            {user.role === 'Admin' && <button className="delete-btn" onClick={() => handleDelete(page.id)}>Delete</button>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PageManagement;
