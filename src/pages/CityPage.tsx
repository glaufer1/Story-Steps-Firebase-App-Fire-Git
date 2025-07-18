import React from 'react';
import { CityPage as CityPageProps } from '../interfaces';
import './PageStyles.css';

const CityPage: React.FC<{ page: CityPageProps }> = ({ page }) => {
    return (
        <div className="page-container">
            <img src={page.imageUrl} alt={page.title} className="page-image" />
            <div className="page-content">
                <h1>{page.title}</h1>
                <p>{page.description}</p>
                {/* We will add a list of tours here later */}
            </div>
        </div>
    );
};

export default CityPage;
