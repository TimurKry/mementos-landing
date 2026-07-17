import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Ecosystem } from "@/components/Ecosystem";
import { Why, Process, ValueBand, Audiences, ContactCta } from "@/components/Sections";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Why />
        <Ecosystem />
        <Process />
        <ValueBand />
        <Audiences />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
