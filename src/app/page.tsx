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
        
        {/* Quick access links - temporary for development */}
        <section className="py-8 bg-gray-50 border-t">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Quick Access (Demo Mode)</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/login"
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Login
                </a>
                <a
                  href="/dashboard"
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/editor"
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Editor
                </a>
                <a
                  href="/billing"
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Billing
                </a>
                <a
                  href="/settings"
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Settings
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}