import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { ProductScene } from "@/components/ProductScene";
import { FeatureCards } from "@/components/FeatureCards";
import { Why, Process, ValueBand, Audiences, ContactCta } from "@/components/Sections";
import { HeuteMorgen } from "@/components/HeuteMorgen";
import { AccessTeaser } from "@/components/AccessTeaser";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Marquee />
        <Why />
        <HeuteMorgen />
        <ProductScene />
        <FeatureCards />
        <Process />
        <ValueBand />
        <AccessTeaser />
        <Audiences />
        <Faq />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
