import React from 'react';
import type { PrePurchaseTourPage as PrePurchaseTourPageProps, Stop } from '../interfaces';
import './PageStyles.css';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';

const PrePurchaseTourPage: React.FC<{ page: PrePurchaseTourPageProps }> = ({ page }) => {

    const formatPrice = (price: number) => {
        if (price === 0) {
            return 'FREE - $0';
        }
        return `Tour Price: $${price.toFixed(2)}`;
    };

    return (
        <div className="mobile-view">
            <header className="tour-header">
                <img src={page.imageUrl} alt={page.title} className="hero-image" />
                <div className="header-controls">
                    <button className="icon-btn"><ArrowLeft size={24} /></button>
                    <div>
                        <button className="icon-btn"><Heart size={24} /></button>
                        <button className="icon-btn"><Share2 size={24} /></button>
                    </div>
                </div>
            </header>

            <main className="tour-content">
                <h1 className="tour-title">{page.title}</h1>
                
                <div className="tour-metadata">
                    <span>{page.distance} miles</span>
                    <span>{page.stops.length} stops</span>
                    <span>{page.travelMode}</span>
                </div>

                {page.previewAudioUrl && (
                    <div className="audio-preview">
                        <p>Preview the tour</p>
                        <audio controls src={page.previewAudioUrl} />
                    </div>
                )}

                <p className="tour-description">{page.description}</p>

                <div className="stop-list">
                    <h2>Tour Stops</h2>
                    <ul>
                        {page.stops.map((stop: Stop, index: number) => (
                            <li key={stop.id} className="stop-item">
                                <img src={stop.heroImageUrl} alt={stop.title} className="stop-thumbnail" />
                                <span className="stop-name">{`Stop ${index + 1}: ${stop.title}`}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            <footer className="sticky-footer">
                <button className="purchase-btn">{formatPrice(page.price)}</button>
            </footer>
        </div>
    );
};

export default PrePurchaseTourPage;
