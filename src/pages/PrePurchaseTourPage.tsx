import React from 'react';
import type { PrePurchaseTourPage as PrePurchaseTourPageInterface, Stop } from '../interfaces';

interface PrePurchaseTourPageProps {
  page: PrePurchaseTourPageInterface & { tourPreviewAudio?: string };
}

const PrePurchaseTourPage: React.FC<PrePurchaseTourPageProps> = ({ page }) => {
  return (
    <div>
      <h1>{page.title}</h1>
      {page.imageUrl && <img src={page.imageUrl} alt={page.title} />}
      <p>Distance: {page.distance}</p>
      <p>Travel Mode: {page.travelMode}</p>
      {page.tourPreviewAudio && (
        <div className="audio-preview">
          <p>Tour Preview:</p>
          <audio controls src={page.tourPreviewAudio}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      {page.description && <p>{page.description}</p>}
      <h2>Stops</h2>
      <ul>
        {page.stops?.map((stop: Stop) => (
          <li key={stop.id}>
            {stop.name}
            {stop.heroImageUrl && <img src={stop.heroImageUrl} alt={stop.name} />}
          </li>
        ))}
      </ul>
      <p>Price: ${page.price}</p>
    </div>
  );
};

export default PrePurchaseTourPage;
