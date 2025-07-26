import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Menu, MenuItem, MenuLocation, AppUser } from '../interfaces';
import ErrorMessage from './ErrorMessage';
import FileUpload from './FileUpload';
import './MenuManager.css';

interface MenuManagerProps {
  user: AppUser;
}

const MenuManager: React.FC<MenuManagerProps> = ({ user: _user }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMenu, setNewMenu] = useState({
    name: '',
    location: MenuLocation.Header
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Predefined menus that shouldn't be deleted
  const PROTECTED_MENUS = ['Customer Menu', 'Back Office Menu'];

  // Available pages for menu items
  const CUSTOMER_PAGES = [
    { title: 'Home', url: '/', pageId: 'home' },
    { title: 'About Us', url: '/about', pageId: 'about' },
    { title: 'Blog', url: '/blog', pageId: 'blog' },
    { title: 'Tours', url: '/tours', pageId: 'tours' },
    { title: 'Cities', url: '/cities', pageId: 'cities' },
    { title: 'My Tours', url: '/my-tours', pageId: 'my-tours' },
    { title: 'My Profile', url: '/my-profile', pageId: 'my-profile' }
  ];

  const BACK_OFFICE_PAGES = [
    { title: 'Back Office Home', url: '/admin/home', pageId: 'admin-home' },
    { title: 'Tour Creator', url: '/admin/tour-creator', pageId: 'tour-creator' },
    { title: 'Edit Tours', url: '/admin/tour-selector', pageId: 'tour-selector' },
    { title: 'Collections', url: '/admin/collections', pageId: 'collections' },
    { title: 'City Management', url: '/admin/city-management', pageId: 'city-management' },
    { title: 'User Management', url: '/admin/user-management', pageId: 'user-management' },
    { title: 'Customer Pages', url: '/admin/customer-pages', pageId: 'customer-pages' }
  ];

  useEffect(() => {
    console.log('🔍 MenuManager - User role:', _user?.role);
    console.log('🔍 MenuManager - User:', _user);
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'menus'));
      const menusData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Menu));
      setMenus(menusData);
    } catch (err) {
      setError('Failed to fetch menus');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenu.name.trim()) {
      setError('Menu name is required');
      return;
    }

    try {
      const menuData = {
        ...newMenu,
        items: [],
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'menus'), menuData);
      console.log('Menu created with ID:', docRef.id);

      setShowCreateForm(false);
      setNewMenu({ name: '', location: MenuLocation.Header });
      fetchMenus();
    } catch (err) {
      setError('Failed to create menu');
      console.error(err);
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    if (PROTECTED_MENUS.includes(menu.name)) {
      setError('Cannot delete protected menus');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this menu?')) return;

    try {
      await deleteDoc(doc(db, 'menus', menuId));
      if (selectedMenu?.id === menuId) {
        setSelectedMenu(null);
      }
      fetchMenus();
    } catch (err) {
      setError('Failed to delete menu');
      console.error(err);
    }
  };

  const handleToggleActive = async (menu: Menu) => {
    try {
      await updateDoc(doc(db, 'menus', menu.id), {
        isActive: !menu.isActive,
        updatedAt: new Date()
      });
      fetchMenus();
    } catch (err) {
      setError('Failed to update menu');
      console.error(err);
    }
  };

  const addMenuItem = (parentId?: string) => {
    if (!selectedMenu) return;

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      title: '',
      url: '',
      order: selectedMenu.items.length,
      parentId,
      children: [],
      isExternal: false,
      isVisible: true
    };

    const updatedMenu = {
      ...selectedMenu,
      items: [...selectedMenu.items, newItem],
      updatedAt: new Date()
    };

    setSelectedMenu(updatedMenu);
    setHasUnsavedChanges(true);
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    if (!selectedMenu) return;

    const updateItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };

    const updatedMenu = {
      ...selectedMenu,
      items: updateItems(selectedMenu.items),
      updatedAt: new Date()
    };

    setSelectedMenu(updatedMenu);
    setHasUnsavedChanges(true);
  };

  const deleteMenuItem = (itemId: string) => {
    if (!selectedMenu) return;

    const removeItem = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => {
        if (item.id === itemId) {
          return false;
        }
        if (item.children) {
          item.children = removeItem(item.children);
        }
        return true;
      });
    };

    const updatedMenu = {
      ...selectedMenu,
      items: removeItem(selectedMenu.items),
      updatedAt: new Date()
    };

    setSelectedMenu(updatedMenu);
    setHasUnsavedChanges(true);
  };

  const updateMenu = async (menu: Menu) => {
    try {
      console.log('🔄 Updating menu:', menu.id);
      console.log('🔄 Menu object received by updateMenu:', menu);

      const { id, ...menuData } = menu;
      
      // Create a new object filtering out undefined values
      const dataToUpdate: { [key: string]: any } = {};
      for (const key in menuData) {
        const value = (menuData as any)[key];
        if (value !== undefined) {
          dataToUpdate[key] = value;
        }
      }

      // If 'items' array exists, recursively clean its contents
      if (Array.isArray(dataToUpdate.items)) {
        dataToUpdate.items = dataToUpdate.items.map((item: any) => {
          const cleanedItem: { [key: string]: any } = {};
          for (const key in item) {
            if (item[key] !== undefined) {
              cleanedItem[key] = item[key];
            }
          }
          // Ensure children are also cleaned recursively
          if (Array.isArray(cleanedItem.children)) {
            cleanedItem.children = cleanedItem.children.map((child: any) => {
              const cleanedChild: { [key: string]: any } = {};
              for (const childKey in child) {
                if (child[childKey] !== undefined) {
                  cleanedChild[childKey] = child[childKey];
                }
              }
              return cleanedChild;
            });
          }
          return cleanedItem;
        });
      }

      console.log('🔄 Data sent to Firestore (undefined filtered):', dataToUpdate);
      
      await updateDoc(doc(db, 'menus', id), dataToUpdate);
      console.log('✅ Menu updated successfully');
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('❌ Error updating menu:', err);
      console.error('❌ Error details:', {
        code: err.code,
        message: err.message,
        details: err
      });
      setError(`Failed to update menu: ${err.message}`);
    }
  };

  const handleSaveMenu = async () => {
    if (!selectedMenu) return;
    await updateMenu(selectedMenu);
  };

  const getAvailablePages = () => {
    if (selectedMenu?.name === 'Customer Menu') {
      return CUSTOMER_PAGES;
    } else if (selectedMenu?.name === 'Back Office Menu') {
      return BACK_OFFICE_PAGES;
    }
    return [...CUSTOMER_PAGES, ...BACK_OFFICE_PAGES];
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const availablePages = getAvailablePages();
    
    return (
      <div key={item.id} className="menu-item" style={{ marginLeft: `${level * 20}px` }}>
        <div className="item-header">
          <input
            type="text"
            placeholder="Menu item title"
            value={item.title}
            onChange={(e) => updateMenuItem(item.id, { title: e.target.value })}
            className="item-title"
          />
          <div className="item-controls">
            <label>
              <input
                type="checkbox"
                checked={item.isVisible}
                onChange={(e) => updateMenuItem(item.id, { isVisible: e.target.checked })}
              />
              Visible
            </label>
            <label>
              <input
                type="checkbox"
                checked={item.isExternal}
                onChange={(e) => updateMenuItem(item.id, { isExternal: e.target.checked })}
              />
              External
            </label>
            <button
              onClick={() => deleteMenuItem(item.id)}
              className="delete-item-btn"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="item-content">
          {item.isExternal ? (
            <input
              type="url"
              placeholder="External URL"
              value={item.url || ''}
              onChange={(e) => updateMenuItem(item.id, { url: e.target.value })}
              className="item-url"
            />
          ) : (
            <select
              value={item.pageId || ''}
              onChange={(e) => {
                const selectedPage = availablePages.find(p => p.pageId === e.target.value);
                updateMenuItem(item.id, { 
                  pageId: e.target.value,
                  url: selectedPage?.url || ''
                });
              }}
              className="item-page-select"
            >
              <option value="">Select a page...</option>
              {availablePages.map(page => (
                <option key={page.pageId} value={page.pageId}>
                  {page.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="item-actions">
          <button
            onClick={() => addMenuItem(item.id)}
            className="add-child-btn"
          >
            Add Child Item
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading menus...</div>;

  return (
    <div className="menu-manager">
      <div className="manager-header">
        <h2>Menu Management</h2>
        <button
          className="create-menu-button"
          onClick={() => setShowCreateForm(true)}
        >
          Create Menu
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {showCreateForm && (
        <div className="create-menu-form">
          <h3>Create New Menu</h3>
          <form onSubmit={handleCreateMenu}>
            <div className="form-group">
              <label>Menu Name:</label>
              <input
                type="text"
                value={newMenu.name}
                onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                placeholder="Enter menu name"
                required
              />
            </div>

            <div className="form-group">
              <label>Location:</label>
              <select
                value={newMenu.location}
                onChange={(e) => setNewMenu({ ...newMenu, location: e.target.value as MenuLocation })}
              >
                <option value={MenuLocation.Header}>Header</option>
                <option value={MenuLocation.Footer}>Footer</option>
                <option value={MenuLocation.Sidebar}>Sidebar</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="create-button">
                Create Menu
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="menus-container">
        <div className="menus-list">
          <h3>Menus</h3>
          <div className="menu-cards">
            {menus.map(menu => (
              <div key={menu.id} className={`menu-card ${selectedMenu?.id === menu.id ? 'selected' : ''}`}>
                <div className="menu-info">
                  <h4>{menu.name}</h4>
                  <p>Location: {menu.location}</p>
                  <p>Items: {menu.items.length}</p>
                </div>
                <div className="menu-actions">
                  <button
                    onClick={() => setSelectedMenu(menu)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(menu)}
                    className={`toggle-button ${menu.isActive ? 'active' : 'inactive'}`}
                  >
                    {menu.isActive ? 'Active' : 'Inactive'}
                  </button>
                  {!PROTECTED_MENUS.includes(menu.name) && (
                    <button
                      onClick={() => handleDeleteMenu(menu.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedMenu && (
          <div className="menu-editor">
            <div className="editor-header">
              <h3>Editing: {selectedMenu.name}</h3>
              {hasUnsavedChanges && (
                <span className="unsaved-changes">⚠️ Unsaved changes</span>
              )}
            </div>

            <div className="logo-upload-section">
              <h4>Menu Logo</h4>
              <FileUpload
                userId={_user?.uid || ''}
                fileType="image"
                context="menu"
                contextId={selectedMenu.id}
                onUploadSuccess={(url) => {
                  setSelectedMenu({ ...selectedMenu, logoUrl: url });
                  setHasUnsavedChanges(true);
                }}
                onUploadError={(error) => setError(error)}
                acceptedFileTypes="image/*"
                maxSizeMB={2}
              />
              {selectedMenu.logoUrl && (
                <div className="logo-preview">
                  <img src={selectedMenu.logoUrl} alt="Menu logo" />
                  <button
                    onClick={() => {
                      setSelectedMenu({ ...selectedMenu, logoUrl: '' });
                      setHasUnsavedChanges(true);
                    }}
                    className="remove-logo-btn"
                  >
                    Remove Logo
                  </button>
                </div>
              )}
            </div>

            <div className="menu-items-section">
              <h4>Menu Items</h4>
              <button
                onClick={() => addMenuItem()}
                className="add-item-button"
              >
                Add Item
              </button>

              <div className="menu-items-list">
                {selectedMenu.items.map(item => renderMenuItem(item))}
              </div>
            </div>

            <div className="editor-actions">
              <button
                onClick={handleSaveMenu}
                className="save-button"
                disabled={!hasUnsavedChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManager; 