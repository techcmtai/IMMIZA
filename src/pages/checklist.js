import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import DocumentChecklist from '@/components/DocumentChecklist';
import Layout from '@/components/Layout';

export default function ChecklistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b76e79]"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Document Checklist | IMMIZA</title>
        <meta name="description" content="View your visa document checklist" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Document Checklist</h1>
        <p className="text-gray-600 mb-8">
          Below is the list of documents required for your visa application. Make sure to prepare all these documents before proceeding with your application.
        </p>

        <DocumentChecklist />
      </div>
    </Layout>
  );
}
