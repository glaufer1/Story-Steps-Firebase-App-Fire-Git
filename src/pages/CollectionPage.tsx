import React from 'react';
import type { CollectionPage as CollectionPageInterface } from '../interfaces';

interface CollectionPageProps {
  page: CollectionPageInterface;
}

const CollectionPage: React.FC<CollectionPageProps> = ({ page }) => {
  return (
    <div>
      <h1>{page.title}</h1>
      {page.imageUrl && <img src={page.imageUrl} alt={page.title} />}
      {page.description && <p>{page.description}</p>}
    </div>
  );
};

export default CollectionPage;
