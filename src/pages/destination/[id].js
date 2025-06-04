import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Import components
import DestinationHero from '@/components/destination/DestinationHero';
import VisaTypeTabs from '@/components/destination/VisaTypeTabs';
import VisaCard from '@/components/destination/VisaCard';
import DocumentChecklist from '@/components/destination/DocumentChecklist';
import LoadingState from '@/components/destination/LoadingState';

export default function DestinationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedVisaType, setSelectedVisaType] = useState("All");
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visaData, setVisaData] = useState([]);

  // Get selected visa type from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVisaType = localStorage.getItem('selectedVisaType');
      if (storedVisaType) {
        setSelectedVisaType(storedVisaType);
      }
    }
  }, []);

  // Scroll to document checklist section when selectedVisaType changes
  useEffect(() => {
    if (!loading && destination && selectedVisaType !== "All") {
      // Add a small delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        const checklistSection = document.getElementById('document-checklist-section');
        if (checklistSection) {
          checklistSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedVisaType, loading, destination]);

  // Fetch destination data from Firebase
  useEffect(() => {
    console.log('Destination page - ID from router.query:', id);

    const fetchDestination = async () => {
      if (!id) {
        console.log('No ID available yet, waiting for router to be ready');
        return;
      }

      console.log('Fetching destination data for ID:', id);
      try {
        setLoading(true);

        // First try to get from countries collection
        const countryRef = doc(db, 'countries', id);
        const countrySnap = await getDoc(countryRef);

        if (countrySnap.exists()) {
          const countryData = {
            id: countrySnap.id,
            ...countrySnap.data()
          };
          setDestination(countryData);

          // Set visa data from Firebase
          if (countryData.visaInfo) {
            setVisaData(countryData.visaInfo);
          } else {
            // Fallback to default visa data if not available
            setVisaData([
              {
                type: "Tourist",
                name: "Tourist Visa",
                typeLabel: "Tourist",
                stay: "30 days",
                validity: "90 days",
                documentChecklist: ["Passport (valid for 6 months)", "Passport-sized photographs"]
              },
              {
                type: "Work",
                name: "Work Visa",
                typeLabel: "Work",
                stay: "60 days",
                validity: "180 days",
                documentChecklist: ["Valid passport", "Offer letter from the employer"]
              },
              {
                type: "Student",
                name: "Student Visa",
                typeLabel: "Student",
                stay: "365 days",
                validity: "365 days",
                documentChecklist: ["Passport (valid for 6 months)", "University admission letter"]
              }
            ]);
          }
        } else {
          // If not found in countries collection, try destinations collection as fallback
          const destinationRef = doc(db, 'destinations', id);
          const destinationSnap = await getDoc(destinationRef);

          if (destinationSnap.exists()) {
            const destinationData = {
              id: destinationSnap.id,
              ...destinationSnap.data()
            };
            setDestination(destinationData);

            // Set visa data from Firebase
            if (destinationData.visaInfo) {
              setVisaData(destinationData.visaInfo);
            } else {
              // Fallback to default visa data if not available
              setVisaData([
                {
                  type: "Tourist",
                  name: "Tourist Visa",
                  typeLabel: "Tourist",
                  stay: "30 days",
                  validity: "90 days",
                  documentChecklist: ["Passport (valid for 6 months)", "Passport-sized photographs"]
                },
                {
                  type: "Work",
                  name: "Work Visa",
                  typeLabel: "Work",
                  stay: "60 days",
                  validity: "180 days",
                  documentChecklist: ["Valid passport", "Offer letter from the employer"]
                },
                {
                  type: "Student",
                  name: "Student Visa",
                  typeLabel: "Student",
                  stay: "365 days",
                  validity: "365 days",
                  documentChecklist: ["Passport (valid for 6 months)", "University admission letter"]
                }
              ]);
            }
          } else {
            console.log('No such destination in either collection!');
            // No data found in Firebase
            router.push('/'); // Redirect to home page if no data found
          }
        }
      } catch (error) {
        console.error("Error fetching destination:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id, router]); // Added 'router' to the dependency array

  // If destination not found or page is still loading
  if (loading || !destination) {
    return <LoadingState />;
  }

  // Calculate a future date for visa processing (15 days from now)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 15);
  const formattedDate = futureDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const filteredVisas =
    selectedVisaType === "All"
      ? visaData
      : visaData.filter((visa) => visa.type === selectedVisaType);
  return (
    <>
      <Head>
        <title>Apply for {destination.name} Visa Online | IMMIZA</title>
        <meta name="description" content={`Apply for ${destination.name} visa - Processing time: ${destination.processingTime}`} />
      </Head>

      <div className="mx-auto">
        {/* Hero Section */}
        <DestinationHero destination={destination} formattedDate={formattedDate} />

        {/* Visa Types Section */}
        <div className="rounded-lg shadow-xl overflow-hidden p-4 sm:p-6">
          <VisaTypeTabs
            selectedVisaType={selectedVisaType}
            setSelectedVisaType={setSelectedVisaType}
            destinationName={destination.name}
          />

          {/* Render Filtered Visa Cards */}
          <div className="space-y-4 sm:space-y-6">
            {filteredVisas.map((visa) => (
              <VisaCard key={visa.type} visa={visa} destination={destination} />
            ))}
          </div>
        </div>

        {/* Document Checklist Section */}
        <DocumentChecklist
          selectedVisaType={selectedVisaType}
          filteredVisas={filteredVisas}
          destination={destination}
          setSelectedVisaType={setSelectedVisaType}
        />
      </div>
    </>
  );
}
