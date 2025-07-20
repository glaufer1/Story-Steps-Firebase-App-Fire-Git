import React, { useState, useEffect, useRef } from 'react';
import type { StopPage as StopPageProps, ContentBlock } from '../interfaces';

// Import all the block components
import TextSection from '../components/StopPageBlocks/TextSection';
import MediaSection from '../components/StopPageBlocks/MediaSection';
import LinkButtonSection from '../components/StopPageBlocks/LinkButtonSection';
import LocationSection from '../components/StopPageBlocks/LocationSection';
import HowToGetFromSection from '../components/StopPageBlocks/HowToGetFromSection';
// Import other block components as they are created...

import './PageStyles.css';

// Helper to render the correct block component based on its type
const renderContentBlock = (block: ContentBlock, userLocation?: any) => {
  switch (block.type) {
    case 'text':
      return <TextSection block={block} />;
    case 'media':
      return <MediaSection block={block} />;
    case 'links':
      return <LinkButtonSection block={block} />;
    case 'location':
      return <LocationSection block={block} />;
    case 'howToGetFrom':
      return <HowToGetFromSection block={block} userLocation={userLocation} />;
    // Add cases for other block types here
    default:
      return <p>Unsupported content block type</p>;
  }
};

// Haversine formula to calculate distance between two lat/lng points in meters
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};


const StopPage: React.FC<{ page: StopPageProps }> = ({ page }) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // --- Geolocation and Geofencing Logic ---
    if (!("geolocation" in navigator)) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        if (hasTriggered) return;

        const distance = getDistance(latitude, longitude, page.latitude, page.longitude);
        
        if (distance < page.geoFenceRadius) {
          console.log("User entered GeoFence. Triggering audio.");
          audioPlayer.current?.play();
          setHasTriggered(true); // Ensure it only triggers once
        }
      },
      (error) => console.error("Error watching position: ", error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [page.latitude, page.longitude, page.geoFenceRadius, hasTriggered]);

  return (
    <div className="mobile-view stop-page">
      <header className="stop-header">
        <img src={page.heroImageUrl} alt={page.title} className="hero-image" />
      </header>
      
      <main className="tour-content">
        <div className="stop-audio-section">
            {/* We can add the audio graphic behind this later */}
            <audio ref={audioPlayer} src={page.audioFileUrl} controls />
            <p className="audio-title">{page.audioFileTitle}</p>
        </div>

        {/* Dynamically render the content blocks */}
        <div className="content-blocks">
          {page.contentBlocks
            .sort((a, b) => a.order - b.order) // Ensure blocks are in the correct order
            .map(block => (
              <div key={block.id}>
                {renderContentBlock(block, userLocation)}
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default StopPage;
