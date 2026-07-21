import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Ecosystem } from "@/components/Ecosystem";
import { Why, Process, ValueBand, Audiences, ContactCta } from "@/components/Sections";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Ecosystem />
        <Why />
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
