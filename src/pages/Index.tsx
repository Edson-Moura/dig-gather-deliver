import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { QuickAssessmentSection } from "@/components/QuickAssessmentSection";
import EbookLeadSection from "@/components/EbookLeadSection";
import { OnboardingSection } from "@/components/OnboardingSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  // Handle safe redirect from external providers (Stripe, etc.)
  const redirectParam = searchParams.get('redirect');
  if (redirectParam) {
    const params = new URLSearchParams(searchParams);
    params.delete('redirect');
    const path = redirectParam.startsWith('/') ? redirectParam : `/${redirectParam}`;
    const qs = params.toString();
    return <Navigate to={qs ? `${path}?${qs}` : path} replace />;
  }

  // Handle scroll to section
  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo) {
      const element = document.getElementById(scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [searchParams]);

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <QuickAssessmentSection />
      <EbookLeadSection />
      <OnboardingSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
