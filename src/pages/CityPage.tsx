import React from 'react';
import type { CityPage as CityPageInterface } from '../interfaces';

interface CityPageProps {
  page: CityPageInterface;
}

const CityPage: React.FC<CityPageProps> = ({ page }) => {
  return (
    <div>
      <h1>{page.title}</h1>
      {page.imageUrl && <img src={page.imageUrl} alt={page.title} />}
      {page.description && <p>{page.description}</p>}
    </div>
  );
};

export default CityPage;
