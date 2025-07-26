import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AppUser } from '../interfaces';
import CustomerHeader from '../components/CustomerHeader';
import './PageStyles.css';
import './MyToursPage.css';

interface Tour {
  id: string;
  title: string;
  imageUrl: string;
  year: number;
}

interface MyToursPageProps {
  user: AppUser;
}

const MyToursPage: React.FC<MyToursPageProps> = ({ user }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      setError('');
      try {
        if (!user?.uid) throw new Error('User not logged in');
        // NOTE: Ensure your Firestore 'tours' collection has a 'userId' field for this query to work
        const q = query(collection(db, 'tours'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const toursData: Tour[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as Tour));
        setTours(toursData);
      } catch (err) {
        setError('Failed to fetch tours.');
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.uid) fetchTours();
  }, [user]);

  // Group tours by year for display
  const toursByYear = tours.reduce<Record<number, Tour[]>>((acc, tour) => {
    const year = tour.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(tour);
    return acc;
  }, {});

  if (loading) return <div>Loading tours...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="my-tours-page">
      <CustomerHeader user={user} />
      
      <main className="tours-content">
        <div className="page-container">
          <h1>My Tours</h1>
          {Object.keys(toursByYear).sort((a, b) => Number(b) - Number(a)).map(year => (
            <div key={year} className="tour-year-section">
              <h2>{year}</h2>
              <div className="my-tours-grid">
                {toursByYear[Number(year)].map((tour: Tour) => (
                  <div key={tour.id} className="tour-card">
                    <img src={tour.imageUrl} alt={tour.title} className="tour-card-image" />
                    <p>{tour.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyToursPage;
