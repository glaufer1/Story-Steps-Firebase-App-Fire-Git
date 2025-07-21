import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { City } from '../interfaces';

const CityManagement: React.FC = () => {
    const [cities, setCities] = useState<City[]>([]);
    const [newCityName, setNewCityName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCities = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'cities'));
                const citiesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as City));
                setCities(citiesData);
            } catch (err) {
                setError('Failed to fetch cities.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCities();
    }, []);

    const handleAddCity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCityName) {
            setError('Please enter a city name.');
            return;
        }
        try {
            const newCity = { name: newCityName };
            const docRef = await addDoc(collection(db, 'cities'), newCity);
            setCities([...cities, { ...newCity, id: docRef.id }]);
            setNewCityName('');
            setError('');
        } catch (err) {
            setError('Failed to add city.');
            console.error(err);
        }
    };

    const handleDeleteCity = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'cities', id));
            setCities(cities.filter((city) => city.id !== id));
        } catch (err) {
            setError('Failed to delete city.');
            console.error(err);
        }
    };

    if (loading) return <p>Loading cities...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Manage Cities</h3>
            <form onSubmit={handleAddCity}>
                <input
                    type="text"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    placeholder="New City Name"
                />
                <button type="submit">Add City</button>
            </form>
            <ul>
                {cities.map((city) => (
                    <li key={city.id}>
                        {city.name}
                        <button onClick={() => handleDeleteCity(city.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CityManagement;
