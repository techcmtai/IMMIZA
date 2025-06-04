import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import dynamic from 'next/dynamic';
import Footer from "@/components/Footer";
import { useRouter } from 'next/router';

// Import Navbar with SSR disabled to prevent hydration issues
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Check if the current page is admin or agent page
  const isAdminPage = router.pathname.startsWith('/admin');
  const isAgentPage = router.pathname.startsWith('/agent');

  // Don't show navbar and footer on admin and agent pages
  const showNavbar = !isAdminPage && !isAgentPage;
  const showFooter = !isAdminPage && !isAgentPage;

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {showNavbar && <Navbar />}
        <main className={`flex-grow ${showNavbar ? 'pt-16' : ''}`}>
          <Component {...pageProps} />
        </main>
        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}
