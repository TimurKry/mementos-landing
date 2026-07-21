import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { ProductScene } from "@/components/ProductScene";
import { Why, Process, ValueBand, Audiences, ContactCta } from "@/components/Sections";
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
        <ProductScene />
        <Process />
        <ValueBand />
        <Audiences />
        <Faq />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
