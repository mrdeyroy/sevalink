import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ImpactSection from "../components/ImpactSection";
import HowItWorks from "../components/HowItWorks";
import Services from "../components/Services";
import Features from "../components/Features";
import GovernmentSection from "../components/GovernmentSection";
import AnalyticsSection from "../components/AnalyticsSection";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

const Home = () => {
    return (
        <div className="font-sans text-gray-900">
            <Navbar />
            <Hero />
            <ImpactSection />
            <HowItWorks />
            <Services />
            <Features />
            <GovernmentSection />
            <AnalyticsSection />
            <CTA />
            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default Home;
