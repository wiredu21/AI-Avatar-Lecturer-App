import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import UniversitySlider from "./UniversitySlider";
import FindYourCourse from "./FindYourCourse";
import CustomiseAILecturer from "./CustomiseAILecturer";
import ChatSimulator from "./ChatSimulator";
import Testimonials from "./Testimonials";
import CTA from "./CTA";
import Footer from "./Footer";

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <section id="hero">
                <Hero />
            </section>
            <section id="features">
                <Features />
            </section>
            <UniversitySlider />
            <FindYourCourse />
            <CustomiseAILecturer />
            <section id="demo">
                <ChatSimulator />
            </section>
            <section id="testimonials">
                <Testimonials />
            </section>
            <CTA />
            <Footer />
        </div>
    );
} 