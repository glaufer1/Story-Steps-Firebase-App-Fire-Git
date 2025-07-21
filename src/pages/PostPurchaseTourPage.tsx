import React from 'react';
import type { PostPurchaseTourPage as PostPurchaseTourPageInterface, Stop } from '../interfaces';

interface PostPurchaseTourPageProps {
  page: PostPurchaseTourPageInterface;
}

const PostPurchaseTourPage: React.FC<PostPurchaseTourPageProps> = ({ page }) => {
  return (
    <div>
      <h1>{page.title}</h1>
      {page.preDepartureHeroImageUrl && <img src={page.preDepartureHeroImageUrl} alt={page.title} />}
      {page.preDepartureAudioUrl && <audio src={page.preDepartureAudioUrl} controls />}
      <h2>Stops</h2>
      <ul>
        {page.stops?.map((stop: Stop) => (
          <li key={stop.id}>
            {stop.name}
            {stop.heroImageUrl && <img src={stop.heroImageUrl} alt={stop.name} />}
          </li>
        ))}
      </ul>
      <p>Total size: {page.totalSizeMB} MB</p>
      <p>Tour time: {page.tourTime}</p>
      {page.description && <p>{page.description}</p>}
    </div>
  );
};

export default PostPurchaseTourPage;
