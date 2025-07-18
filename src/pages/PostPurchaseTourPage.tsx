import React, { useState, useEffect } from 'react';
import { PostPurchaseTourPage as PostPurchaseTourPageProps } from '../interfaces';
import Modal from '../components/Modal'; 
import './PageStyles.css';
import { ArrowLeft, Share2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';

const PostPurchaseTourPage: React.FC<{ page: PostPurchaseTourPageProps }> = ({ page }) => {
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Listen for messages from the service worker
    useEffect(() => {
        const handleServiceWorkerMessage = (event: MessageEvent) => {
            if (event.data.type === 'DOWNLOAD_COMPLETE' && event.data.payload.tourId === page.id) {
                setIsDownloading(false);
                setIsDownloaded(true);
            }
        };
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        // Check if the tour is already cached
        caches.has(`tour-${page.id}`).then(setIsDownloaded);

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        };
    }, [page.id]);

    const handleDownload = async () => {
        setIsDownloading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        let authToken = '';
        if (user) {
            authToken = await user.getIdToken();
        }

        // Collect all URLs to download
        const urlsToCache = [
            page.preDepartureHeroImageUrl,
            page.preDepartureAudioUrl,
            ...page.stops.flatMap(stop => [stop.thumbnailUrl, stop.audioUrl, stop.videoUrl])
        ].filter(url => url); // Filter out any undefined/null URLs

        // Send a message to the service worker to start the download
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'DOWNLOAD_TOUR',
                payload: {
                    tourId: page.id,
                    urls: urlsToCache,
                    authToken
                }
            });
        }
    };

    const handlePlayAudio = () => {
        if (!isDownloaded) {
            setIsModalOpen(true);
        } else {
            console.log("Playing introductory audio from cache...");
        }
    };
    
    const handleStreamAnyway = () => {
        setIsModalOpen(false);
        console.log("Streaming introductory audio...");
    }

    const getButtonText = () => {
        if (isDownloading) return 'Downloading...';
        if (isDownloaded) return 'Start Tour';
        return `Download Tour (${page.totalSizeMB} MB)`;
    };

    return (
        <div className="mobile-view post-purchase">
            <header className="tour-header">
                <img src={page.preDepartureHeroImageUrl || page.imageUrl} alt={page.title} className="hero-image" />
                <div className="header-controls">
                    <button className="icon-btn"><ArrowLeft size={24} /></button>
                    <button className="icon-btn"><Share2 size={24} /></button>
                </div>
            </header>

            <main className="tour-content">
                <h1 className="tour-title">{page.title}</h1>
                
                <div className="tour-metadata">
                    <span>{page.stops.length} stops</span>
                    <span>{page.tourTime}</span>
                </div>

                <div className="audio-player-section">
                    <button onClick={handlePlayAudio} className="audio-play-btn">Listen to the Introduction</button>
                    <p className="tour-description">{page.description}</p>
                </div>

                <button className="view-stops-btn">View All Stops</button>
            </main>

            <footer className="sticky-footer">
                <button 
                    onClick={handleDownload} 
                    className="purchase-btn" 
                    disabled={isDownloading || isDownloaded}
                >
                    {getButtonText()}
                </button>
            </footer>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2>Enable Offline Use?</h2>
                <p>For the best experience, we recommend downloading the tour. This ensures smooth playback and map tracking, even without an internet connection.</p>
                <div className="modal-actions">
                    <button className="modal-btn primary" onClick={() => { setIsModalOpen(false); handleDownload(); }}>Download Tour</button>
                    <button className="modal-btn secondary" onClick={handleStreamAnyway}>Stream Anyway</button>
                </div>
            </Modal>
        </div>
    );
};

export default PostPurchaseTourPage;
