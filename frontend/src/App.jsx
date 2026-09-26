import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Investigation from "./components/Investigation/Investigation.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import FundFlow from "./components/FundFlow/FundFlow.jsx";
import NetworkMap from "./components/NetworkMap/NetworkMap.jsx";
import LandingFooter from "./components/Landing/LandingFooter.jsx";

import PageTransition from "./PageTransition.jsx";
import ScrollReveal from "./ScrollReveal.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";

import AboutTraceX from "./pages/AboutTraceX.jsx";

function InvestigationPage() {
  return (
    <PageTransition>
      <>
        <Navbar />

        <Hero />

        <ScrollReveal>
          <Investigation />
        </ScrollReveal>

        <ScrollReveal>
          <Dashboard />
        </ScrollReveal>

        <ScrollReveal>
          <FundFlow />
        </ScrollReveal>

        <ScrollReveal>
          <NetworkMap />
        </ScrollReveal>

        {/* <ScrollReveal>
          <Footer />
        </ScrollReveal> */}

        <LandingFooter />
      </>
    </PageTransition>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        {/* Protected Investigation Page */}
        <Route
          path="/investigate"
          element={
            <ProtectedRoute>
              <InvestigationPage />
            </ProtectedRoute>
          }
        />
        {/* About section */}
        <Route path="/about" element={<AboutTraceX />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
