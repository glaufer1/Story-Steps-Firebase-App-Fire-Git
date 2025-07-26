import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CustomerPage, PageSection, SectionType } from '../interfaces';
import './PublicHomePage.css';

const PublicHomePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomerPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      // First try to fetch by slug
      const pagesRef = collection(db, 'customerPages');
      const q = query(pagesRef, where('slug', '==', slug), where('isPublished', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const pageDoc = querySnapshot.docs[0];
        const pageData = {
          ...pageDoc.data(),
          id: pageDoc.id,
          createdAt: pageDoc.data().createdAt?.toDate(),
          updatedAt: pageDoc.data().updatedAt?.toDate()
        } as CustomerPage;
        setPage(pageData);
      } else {
        setError('Page not found or not published');
      }
    } catch (err) {
      setError('Failed to load page');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case SectionType.Header:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="section-header">
              <h1>{section.title || 'Welcome'}</h1>
              {section.content.text && (
                <div className="header-content" dangerouslySetInnerHTML={{ __html: section.content.text }} />
              )}
            </div>
          </section>
        );

      case SectionType.Text:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="text-section">
              {section.title && <h2>{section.title}</h2>}
              {section.content.text && (
                <div className="text-content" dangerouslySetInnerHTML={{ __html: section.content.text }} />
              )}
            </div>
          </section>
        );

      case SectionType.Gallery:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="gallery-section">
              {section.title && <h2>{section.title}</h2>}
              {section.content.images && section.content.images.length > 0 && (
                <div className="gallery-grid">
                  {section.content.images.map((image: string, index: number) => (
                    <div key={index} className="gallery-item">
                      <img src={image} alt={`Gallery item ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case SectionType.AudioPlayer:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="audio-section">
              {section.title && <h2>{section.title}</h2>}
              {section.content.audioUrl && (
                <div className="audio-player">
                  <audio controls>
                    <source src={section.content.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </section>
        );

      case SectionType.Map:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="map-section">
              {section.title && <h2>{section.title}</h2>}
              {section.content.latitude && section.content.longitude && (
                <div className="map-container">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${section.content.latitude},${section.content.longitude}`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </section>
        );

      case SectionType.TourContent:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="tour-content-section">
              <h2>{section.content.title}</h2>
              <div className="tour-info">
                <p><strong>City:</strong> {section.content.city}</p>
                {section.content.price && <p><strong>Price:</strong> ${section.content.price}</p>}
                {section.content.description && (
                  <div className="tour-description" dangerouslySetInnerHTML={{ __html: section.content.description }} />
                )}
              </div>
            </div>
          </section>
        );

      case SectionType.StopContent:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="stop-content-section">
              <h2>{section.content.name}</h2>
              <div className="stop-info">
                <p><strong>Location:</strong> {section.content.location.latitude}, {section.content.location.longitude}</p>
              </div>
            </div>
          </section>
        );

      case SectionType.ContactForm:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="contact-section">
              {section.title && <h2>{section.title}</h2>}
              <form className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name:</label>
                  <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message:</label>
                  <textarea id="message" name="message" rows={5} required></textarea>
                </div>
                <button type="submit" className="submit-button">Send Message</button>
              </form>
            </div>
          </section>
        );

      case SectionType.SocialMedia:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="social-media-section">
              {section.title && <h2>{section.title}</h2>}
              {section.content.links && section.content.links.length > 0 && (
                <div className="social-links">
                  {section.content.links.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      default:
        return (
          <section key={section.id} className={`page-section ${section.isVisible ? '' : 'hidden'}`}>
            <div className="custom-section">
              {section.title && <h2>{section.title}</h2>}
              {section.content.text && (
                <div className="custom-content" dangerouslySetInnerHTML={{ __html: section.content.text }} />
              )}
            </div>
          </section>
        );
    }
  };

  if (loading) return <div className="loading">Loading page...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!page) return <div className="error">Page not found</div>;

  return (
    <div className="public-home-page">
      <div className="page-header">
        <h1>{page.title}</h1>
        {page.description && <p className="page-description">{page.description}</p>}
      </div>

      <div className="page-content">
        {page.sections
          .sort((a, b) => a.order - b.order)
          .map(section => renderSection(section))}
      </div>

      {page.sections.length === 0 && (
        <div className="no-content">
          <p>No content has been added to this page yet.</p>
        </div>
      )}
    </div>
  );
};

export default PublicHomePage; 