import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CustomerPage, PageSection, SectionType, Tour, AppUser } from '../interfaces';
import ErrorMessage from './ErrorMessage';
import FileUpload from './FileUpload';
import './CustomerPageEditor.css';

interface CustomerPageEditorProps {
  user: AppUser;
}

const CustomerPageEditor: React.FC<CustomerPageEditorProps> = ({ user }) => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<CustomerPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (pageId) {
      fetchPage();
      fetchTours();
    }
  }, [pageId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const pageDoc = await getDoc(doc(db, 'customerPages', pageId!));
      if (pageDoc.exists()) {
        const pageData = {
          ...pageDoc.data(),
          id: pageDoc.id,
          createdAt: pageDoc.data().createdAt?.toDate(),
          updatedAt: pageDoc.data().updatedAt?.toDate()
        } as CustomerPage;
        setPage(pageData);
      } else {
        setError('Page not found');
      }
    } catch (err) {
      setError('Failed to fetch page');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tours'));
      const toursData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Tour));
      setTours(toursData);
    } catch (err) {
      console.error('Failed to fetch tours:', err);
    }
  };

  const handleSave = async () => {
    if (!page) return;

    try {
      await updateDoc(doc(db, 'customerPages', page.id), {
        ...page,
        updatedAt: new Date()
      });
      setHasUnsavedChanges(false);
      setError('');
    } catch (err) {
      setError('Failed to save page');
      console.error(err);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to leave without saving?')) {
        navigate('/admin/customer-pages');
      }
    } else {
      navigate('/admin/customer-pages');
    }
  };

  const handleBackOfficeHome = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to leave without saving?')) {
        navigate('/admin/home');
      }
    } else {
      navigate('/admin/home');
    }
  };

  const addSection = (type: SectionType) => {
    if (!page) return;

    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      type,
      title: '',
      content: {},
      order: page.sections.length,
      isVisible: true
    };

    setPage({
      ...page,
      sections: [...page.sections, newSection]
    });
    setHasUnsavedChanges(true);
  };

  const updateSection = (sectionId: string, updates: Partial<PageSection>) => {
    if (!page) return;

    setPage({
      ...page,
      sections: page.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    });
    setHasUnsavedChanges(true);
  };

  const deleteSection = (sectionId: string) => {
    if (!page) return;

    setPage({
      ...page,
      sections: page.sections.filter(section => section.id !== sectionId)
    });
    setHasUnsavedChanges(true);
  };

  const handleTourSelect = (tourId: string) => {
    setSelectedTour(tourId);
    const tour = tours.find(t => t.id === tourId);
    if (tour) {
      // Auto-populate page with tour content
      const tourContentSection: PageSection = {
        id: `tour-content-${Date.now()}`,
        type: SectionType.TourContent,
        title: `Tour: ${tour.title}`,
        content: {
          tourId: tour.id,
          title: tour.title,
          description: tour.description,
          city: tour.city,
          price: tour.price
        },
        order: page?.sections.length || 0,
        isVisible: true
      };

      if (page) {
        setPage({
          ...page,
          sections: [...page.sections, tourContentSection]
        });
        setHasUnsavedChanges(true);
      }
    }
  };

  const renderSectionEditor = (section: PageSection) => {
    switch (section.type) {
      case SectionType.Header:
        return (
          <div className="section-editor">
            <h4>Header Section</h4>
            <input
              type="text"
              placeholder="Section Title"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
            />
            <textarea
              placeholder="Header content"
              value={section.content.text || ''}
              onChange={(e) => updateSection(section.id, { 
                content: { ...section.content, text: e.target.value }
              })}
              rows={4}
            />
          </div>
        );

      case SectionType.Text:
        return (
          <div className="section-editor">
            <h4>Text Section</h4>
            <input
              type="text"
              placeholder="Section Title"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
            />
            <textarea
              placeholder="Text content"
              value={section.content.text || ''}
              onChange={(e) => updateSection(section.id, { 
                content: { ...section.content, text: e.target.value }
              })}
              rows={6}
            />
          </div>
        );

      case SectionType.Gallery:
        return (
          <div className="section-editor">
            <h4>Gallery Section</h4>
            <input
              type="text"
              placeholder="Section Title"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
            />
            <FileUpload
              userId={user.uid}
              fileType="image"
              context="page"
              contextId={page?.id}
              maxSizeMB={5}
              onUploadSuccess={(url) => {
                const images = section.content.images || [];
                updateSection(section.id, {
                  content: { ...section.content, images: [...images, url] }
                });
              }}
              onUploadError={setError}
              buttonText="Upload Image"
              acceptedFileTypes="image/*"
            />
            <div className="gallery-preview">
              {(section.content.images || []).map((image: string, index: number) => (
                <div key={index} className="gallery-item">
                  <img src={image} alt={`Gallery item ${index + 1}`} />
                  <button
                    onClick={() => {
                      const images = section.content.images.filter((_: string, i: number) => i !== index);
                      updateSection(section.id, {
                        content: { ...section.content, images }
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case SectionType.AudioPlayer:
        return (
          <div className="section-editor">
            <h4>Audio Player Section</h4>
            <input
              type="text"
              placeholder="Section Title"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
            />
            <FileUpload
              userId={user.uid}
              fileType="audio"
              context="page"
              contextId={page?.id}
              maxSizeMB={10}
              onUploadSuccess={(url) => {
                updateSection(section.id, {
                  content: { ...section.content, audioUrl: url }
                });
              }}
              onUploadError={setError}
              buttonText="Upload Audio"
              acceptedFileTypes="audio/*"
            />
            {section.content.audioUrl && (
              <audio controls>
                <source src={section.content.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        );

      case SectionType.Map:
        return (
          <div className="section-editor">
            <h4>Map Section</h4>
            <input
              type="text"
              placeholder="Section Title"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
            />
            <input
              type="number"
              placeholder="Latitude"
              value={section.content.latitude || ''}
              onChange={(e) => updateSection(section.id, {
                content: { ...section.content, latitude: parseFloat(e.target.value) }
              })}
            />
            <input
              type="number"
              placeholder="Longitude"
              value={section.content.longitude || ''}
              onChange={(e) => updateSection(section.id, {
                content: { ...section.content, longitude: parseFloat(e.target.value) }
              })}
            />
            <input
              type="text"
              placeholder="Address"
              value={section.content.address || ''}
              onChange={(e) => updateSection(section.id, {
                content: { ...section.content, address: e.target.value }
              })}
            />
          </div>
        );

      case SectionType.TourContent:
        return (
          <div className="section-editor">
            <h4>Tour Content Section</h4>
            <p>Tour: {section.content.title}</p>
            <p>City: {section.content.city}</p>
            <p>Price: ${section.content.price}</p>
            <textarea
              placeholder="Tour description"
              value={section.content.description || ''}
              onChange={(e) => updateSection(section.id, {
                content: { ...section.content, description: e.target.value }
              })}
              rows={4}
            />
          </div>
        );

      case SectionType.StopContent:
        return (
          <div className="section-editor">
            <h4>Stop Content Section</h4>
            <p>Stop: {section.content.name}</p>
            <p>Location: {section.content.location.latitude}, {section.content.location.longitude}</p>
          </div>
        );

      default:
        return (
          <div className="section-editor">
            <h4>Custom Section</h4>
            <input
              type="text"
              placeholder="Section Title"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
            />
            <textarea
              placeholder="Custom content"
              value={section.content.text || ''}
              onChange={(e) => updateSection(section.id, {
                content: { ...section.content, text: e.target.value }
              })}
              rows={4}
            />
          </div>
        );
    }
  };

  if (loading) return <div className="loading">Loading page editor...</div>;
  if (!page) return <ErrorMessage message="Page not found" />;

  return (
    <div className="customer-page-editor">
      <div className="editor-header">
        <h2>Editing: {page.title}</h2>
        <div className="editor-actions">
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
          <button className="back-button" onClick={handleBack}>
            Back
          </button>
          <button className="home-button" onClick={handleBackOfficeHome}>
            Back Office Home
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="editor-content">
        <div className="page-settings">
          <h3>Page Settings</h3>
          <div className="form-group">
            <label>Page Title:</label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => {
                setPage({ ...page, title: e.target.value });
                setHasUnsavedChanges(true);
              }}
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={page.description || ''}
              onChange={(e) => {
                setPage({ ...page, description: e.target.value });
                setHasUnsavedChanges(true);
              }}
              rows={3}
            />
          </div>
        </div>

        <div className="content-selector">
          <h3>Add Content</h3>
          <div className="tour-selector">
            <label>Select Tour to Auto-Populate:</label>
            <select
              value={selectedTour}
              onChange={(e) => handleTourSelect(e.target.value)}
            >
              <option value="">Choose a tour...</option>
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>
                  {tour.title} - {tour.city}
                </option>
              ))}
            </select>
          </div>

          <div className="section-buttons">
            <h4>Add Section:</h4>
            <button onClick={() => addSection(SectionType.Header)}>Header</button>
            <button onClick={() => addSection(SectionType.Text)}>Text</button>
            <button onClick={() => addSection(SectionType.Gallery)}>Gallery</button>
            <button onClick={() => addSection(SectionType.AudioPlayer)}>Audio Player</button>
            <button onClick={() => addSection(SectionType.Map)}>Map</button>
            <button onClick={() => addSection(SectionType.ContactForm)}>Contact Form</button>
            <button onClick={() => addSection(SectionType.SocialMedia)}>Social Media</button>
            <button onClick={() => addSection(SectionType.Custom)}>Custom</button>
          </div>
        </div>

        <div className="sections-container">
          <h3>Page Sections</h3>
          {page.sections.map((section, index) => (
            <div key={section.id} className="section-container">
              <div className="section-header">
                <h4>{section.type} Section {index + 1}</h4>
                <div className="section-controls">
                  <label>
                    <input
                      type="checkbox"
                      checked={section.isVisible}
                      onChange={(e) => updateSection(section.id, { isVisible: e.target.checked })}
                    />
                    Visible
                  </label>
                  <button
                    className="delete-section"
                    onClick={() => deleteSection(section.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {renderSectionEditor(section)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerPageEditor; 