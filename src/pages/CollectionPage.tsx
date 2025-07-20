import React from 'react';
import type { CollectionPage as CollectionPageProps } from '../interfaces';
import './PageStyles.css';

const CollectionPage: React.FC<{ page: CollectionPageProps }> = ({ page }) => {
    return (
        <div className="page-container">
            <img src={page.imageUrl} alt={page.title} className="page-image" />
            <div className="page-content">
                <h1>{page.title}</h1>
                <p>{page.description}</p>
                {/* We will add a list of items here later */}
            </div>
        </div>
    );
};

export default CollectionPage;
