import React from 'react';
import type { Tour } from '../interfaces'; // Assuming a generic Tour interface
import './PageStyles.css';

// This is placeholder data. We will fetch this from Firestore later.
const MOCK_TOURS = [
    { id: '1', title: 'Historic Downtown Walking Tour', imageUrl: 'https://via.placeholder.com/150/FFC107/000000?Text=Tour+1', year: 2023 },
    { id: '2', title: 'Culinary Delights of the North End', imageUrl: 'https://via.placeholder.com/150/4CAF50/FFFFFF?Text=Tour+2', year: 2023 },
    { id: '3', title: 'Architectural Wonders (FREE)', imageUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?Text=Tour+3', year: 2022 },
];

const MyToursPage: React.FC = () => {
    // Group tours by year for display
    const toursByYear = MOCK_TOURS.reduce((acc, tour) => {
        const year = tour.year;
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(tour);
        return acc;
    }, {} as Record<number, typeof MOCK_TOURS>);

    return (
        <div className="page-container">
            <h1>My Tours</h1>
            {Object.keys(toursByYear).sort((a, b) => Number(b) - Number(a)).map(year => (
                <div key={year} className="tour-year-section">
                    <h2>{year}</h2>
                    <div className="my-tours-grid">
                        {toursByYear[Number(year)].map(tour => (
                            <div key={tour.id} className="tour-card">
                                <img src={tour.imageUrl} alt={tour.title} className="tour-card-image" />
                                <p>{tour.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyToursPage;
