import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            E-commerce Email Template Builder
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create professional marketing emails in minutes with our specialized 
            drag-and-drop editor designed for e-commerce stores.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/signup"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/templates"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                View Templates
              </Link>
            </div>
          </div>
          
          {/* Quick access links */}
          <div className="mt-16 flex flex-col items-center space-y-4">
            <p className="text-gray-600">Quick Access (Demo Mode)</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Login Page
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                href="/editor"
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Email Editor
              </Link>
              <Link
                href="/billing"
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Billing
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}