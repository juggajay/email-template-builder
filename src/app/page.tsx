import { Header, Hero, SocialProof, Features, GrowthCalculator, Footer } from '@/components/landing';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <SocialProof />
        <Features />
        <GrowthCalculator />
      </main>
      <Footer />
    </>
  );
}