import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import SalesLayout from '@/components/sales/SalesLayout';
import CountryManager from '@/components/sales/CountryManager';

export default function CountriesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Check if user is authenticated and is an admin
  useEffect(() => {
    console.log('Countries page - User:', user ? `${user.username} (${user.role})` : 'No user');
    console.log('Countries page - Loading:', loading);

    if (!loading && (!user || !['admin', 'sales'].includes(user.role))) {
      console.log('Countries page - Redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b76e79]"></div>
      </div>
    );
  }

  return (
    <SalesLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Country Management</h1>
            <p className="text-gray-600 mt-2">
              Manage country information that will be displayed to users.
              This data will be stored in Firebase and used throughout the application.
            </p>
          </div>
          <Link href="/sales" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded inline-flex items-center">
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <CountryManager />
      </div>
    </SalesLayout>
  );
}
