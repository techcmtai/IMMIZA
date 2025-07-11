import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import dynamic from 'next/dynamic';
import Footer from "@/components/Footer";
import { useRouter } from 'next/router';
import Head from 'next/head';

// Import Navbar with SSR disabled to prevent hydration issues
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Check if the current page is admin or agent page
  const isAdminPage = router.pathname.startsWith('/admin');
  const isAgentPage = router.pathname.startsWith('/agent');
  const isSalesPage = router.pathname.startsWith('/sales');

  // Don't show navbar and footer on admin and agent pages
  const showNavbar = !isAdminPage && !isAgentPage && !isSalesPage;
  const showFooter = !isAdminPage && !isAgentPage && !isSalesPage;

  return (
    <AuthProvider>
      <>
        <Head>
          <title>Immiza - Visa Consultation</title>
          <meta name="description" content="Immiza - Visa Immigration Services & Consultation" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#b76e79" />
          <link rel="icon" href="/favicon.ico" />
          {/* Open Graph */}
          <meta property="og:title" content="Immiza - Visa Services & Admin Panel" />
          <meta property="og:description" content="Admin panel and visa services for Immiza. Manage users, applications, and more." />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="/og-image.png" />
          <meta property="og:url" content="https://immiza.com" />
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Immiza - Visa Services & Admin Panel" />
          <meta name="twitter:description" content="Admin panel and visa services for Immiza. Manage users, applications, and more." />
          <meta name="twitter:image" content="/og-image.png" />
        </Head>
        <div className="flex flex-col min-h-screen">
          {showNavbar && <Navbar />}
          <main className={`flex-grow ${showNavbar ? 'pt-16' : ''}`}>
            <Component {...pageProps} />
          </main>
          {showFooter && <Footer />}
        </div>
      </>
    </AuthProvider>
  );
}
