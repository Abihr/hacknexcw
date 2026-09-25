import LandingNavbar from "../components/Landing/LandingNavbar.jsx";
import LandingHero from "../components/Landing/LandingHero.jsx";
import HowItWorks from "../components/Landing/HowItWorks.jsx";
import OutputPreview from "../components/Landing/OutputPreview.jsx";
import Features from "../components/Landing/Features.jsx";
import FAQ from "../components/Landing/FAQ.jsx";
import LandingCTA from "../components/Landing/LandingCTA.jsx";
import PageTransition from "../PageTransition.jsx";
import ScrollReveal from "../ScrollReveal.jsx";

function LandingPage() {
    return (
        <PageTransition>
            <main className="landing-page">

                <LandingNavbar />

                <LandingHero />

                <ScrollReveal>
                    <HowItWorks />
                </ScrollReveal>

                <ScrollReveal>
                    <OutputPreview />
                </ScrollReveal>

                <ScrollReveal>
                    <Features />
                </ScrollReveal>

                <ScrollReveal>
                    <FAQ />
                </ScrollReveal>

                <ScrollReveal>
                    <LandingCTA />
                </ScrollReveal>

            </main>
        </PageTransition>
    );
}

export default LandingPage;