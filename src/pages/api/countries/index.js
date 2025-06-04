import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Fetch countries from Firebase
    const countriesCollection = collection(db, 'countries');
    const countrySnapshot = await getDocs(countriesCollection);
    
    const countries = countrySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      // Only return id and name for dropdown purposes
    }));

    // Sort countries alphabetically by name
    const sortedCountries = countries.sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return res.status(200).json({
      success: true,
      countries: sortedCountries,
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch countries',
      error: error.message,
    });
  }
}
