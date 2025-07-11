import { Geist, Geist_Mono } from "next/font/google";
import HeroSection from "@/components/HeroSection";
import HomeCard from "@/components/HomeCard";
import ProcessSteps from "@/components/ProcessSteps";
import Testimonials from "@/components/Testimonials";
import SelectedVisaInfo from "@/components/SelectedVisaInfo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className={`min-h-screen bg-white ${geistSans.variable} ${geistMono.variable}`}>
      <HeroSection />
      <SelectedVisaInfo />
      <HomeCard />
      <ProcessSteps />
      <Testimonials />
    </div>
  );
}
