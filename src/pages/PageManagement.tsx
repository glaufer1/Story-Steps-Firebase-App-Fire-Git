import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Page } from '../interfaces';
import { PageType } from '../interfaces';
import CreatePageForm from '../components/CreatePageForm';
import { Link } from 'react-router-dom';

const PageManagement: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      const querySnapshot = await getDocs(collection(db, 'pages'));
      const pagesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Page));
      setPages(pagesData);
    };
    fetchPages();
  }, []);

  const handleCreatePage = async (title: string, type: PageType) => {
    const newPage = { title, type };
    const docRef = await addDoc(collection(db, 'pages'), newPage);
    setPages([...pages, { id: docRef.id, ...newPage }]);
  };

  const handleDeletePage = async (id: string) => {
    await deleteDoc(doc(db, 'pages', id));
    setPages(pages.filter((page) => page.id !== id));
  };

  return (
    <div>
      <h2>Page Management</h2>
      <CreatePageForm onCreate={handleCreatePage} />
      <ul>
        {pages.map((page) => (
          <li key={page.id}>
            {page.title} ({page.type})
            {page.type === PageType.StopPage && (
              <Link to={`/editor/stop-page/${page.id}`}>Edit</Link>
            )}
            <button onClick={() => handleDeletePage(page.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageManagement;
