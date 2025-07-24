'use client';

import { ZebCharacter } from '@/components/brand';
import { ArrowUp, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './privacy.module.css';

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-collected', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Information' },
  { id: 'information-sharing', title: 'Information Sharing & Disclosure' },
  { id: 'data-storage', title: 'Data Storage & Security' },
  { id: 'your-rights', title: 'Your Rights & Choices' },
  { id: 'california-privacy', title: 'California Privacy Rights (CCPA)' },
  { id: 'european-privacy', title: 'European Privacy Rights (GDPR)' },
  { id: 'children-privacy', title: "Children's Privacy" },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'cookies', title: 'Cookies & Tracking' },
  { id: 'changes', title: 'Changes to Privacy Policy' },
  { id: 'contact', title: 'Contact Information' },
];

export default function PrivacyPage() {
  const lastUpdated = 'January 24, 2025';

  const handlePrint = () => {
    window.print();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${styles.printContainer}`}>
      {/* Page Header */}
      <div className="border-b">
        <div className="px-6 py-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-zebra-black mb-2">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {lastUpdated}
            </p>
            <p className="mt-4 text-gray-700">
              At ZebaMail, we take your privacy seriously. This policy explains how we collect, 
              use, and protect your information when you use our email template builder for Shopify.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-6 py-8">
        <div className="max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Desktop Only */}
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Table of Contents
                </h2>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-gray-600 hover:text-growth-green transition-colors py-1"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 pt-8 border-t">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="lg:col-span-3 prose prose-lg max-w-none">
              {/* Introduction */}
              <section id="introduction" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to ZebaMail (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We provide an email template builder 
                  specifically designed for Shopify merchants to create professional, conversion-optimized 
                  email campaigns. This Privacy Policy describes how we collect, use, share, and protect 
                  your personal information when you use our website, services, and applications 
                  (collectively, the &quot;Services&quot;).
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By using ZebaMail, you agree to the collection and use of information in accordance 
                  with this policy. If you do not agree with this policy, please do not use our Services.
                </p>
              </section>

              {/* Information We Collect */}
              <section id="information-collected" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">2. Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect various types of information to provide and improve our Services:
                </p>
                
                <h3 className="text-xl font-semibold text-zebra-black mb-3">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Account Information:</strong> Name, email address, password, and company details when you create an account</li>
                  <li><strong>Billing Information:</strong> Payment card details and billing address (processed securely by Stripe)</li>
                  <li><strong>Store Information:</strong> Your Shopify store domain and related business information</li>
                  <li><strong>Template Data:</strong> Email templates, designs, content, and brand assets you create or upload</li>
                  <li><strong>Communication Data:</strong> Information you provide when contacting our support team</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">2.2 Information We Automatically Collect</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Usage Data:</strong> How you interact with our Services, features used, and performance metrics</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
                  <li><strong>Log Data:</strong> Server logs including access times, pages viewed, and referring URLs</li>
                  <li><strong>Cookie Data:</strong> Information collected through cookies and similar tracking technologies</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">2.3 Information from Third Parties</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Shopify Integration:</strong> Store information and permissions when you connect your Shopify account</li>
                  <li><strong>Analytics Providers:</strong> Aggregated data about Service usage and performance</li>
                  <li><strong>Payment Processors:</strong> Transaction confirmations and dispute information from Stripe</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section id="how-we-use" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the collected information for various purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Service Provision:</strong> To provide, maintain, and improve our email template builder</li>
                  <li><strong>Account Management:</strong> To manage your account, authenticate users, and provide customer support</li>
                  <li><strong>Payment Processing:</strong> To process transactions and send billing-related communications</li>
                  <li><strong>Communication:</strong> To send service updates, security alerts, and support messages</li>
                  <li><strong>Marketing:</strong> To send promotional emails about new features or services (with your consent)</li>
                  <li><strong>Analytics:</strong> To understand how our Services are used and improve user experience</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
                  <li><strong>Security:</strong> To detect, prevent, and address technical issues and fraud</li>
                </ul>
              </section>

              {/* Information Sharing & Disclosure */}
              <section id="information-sharing" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">4. Information Sharing & Disclosure</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:
                </p>
                
                <h3 className="text-xl font-semibold text-zebra-black mb-3">4.1 Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We share information with trusted third-party service providers who assist us in operating our Services:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Supabase:</strong> Database hosting and authentication services</li>
                  <li><strong>Stripe:</strong> Payment processing and billing management</li>
                  <li><strong>Resend:</strong> Transactional email delivery</li>
                  <li><strong>Unlayer:</strong> Email editor functionality</li>
                  <li><strong>Google Analytics:</strong> Website analytics and performance monitoring</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">4.2 Other Disclosures</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Legal Requirements:</strong> When required by law, subpoena, or court order</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Protection of Rights:</strong> To protect the rights, property, or safety of ZebaMail, our users, or others</li>
                  <li><strong>With Consent:</strong> When you explicitly consent to sharing for a specific purpose</li>
                  <li><strong>Aggregated Data:</strong> Non-identifiable aggregated data for research or marketing purposes</li>
                </ul>
              </section>

              {/* Data Storage & Security */}
              <section id="data-storage" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">5. Data Storage & Security</h2>
                
                <h3 className="text-xl font-semibold text-zebra-black mb-3">5.1 Data Storage</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Your data is stored on secure servers provided by Supabase</li>
                  <li>Data may be processed and stored in multiple geographic locations</li>
                  <li>We implement appropriate data backup and recovery procedures</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">5.2 Security Measures</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Industry-standard encryption for data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls limiting data access to authorized personnel</li>
                  <li>Secure password requirements and optional two-factor authentication</li>
                  <li>Regular security training for our team members</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">5.3 Data Retention</h3>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our Services 
                  and comply with legal obligations. When you delete your account, we will delete or 
                  anonymize your personal information within 30 days, except where retention is required 
                  by law.
                </p>
              </section>

              {/* Your Rights & Choices */}
              <section id="your-rights" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">6. Your Rights & Choices</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal requirements</li>
                  <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser</li>
                  <li><strong>Do Not Track:</strong> We respect Do Not Track browser settings</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, please contact us at support@zebamail.com. We will respond 
                  to your request within 30 days.
                </p>
              </section>

              {/* California Privacy Rights (CCPA) */}
              <section id="california-privacy" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">7. California Privacy Rights (CCPA)</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you are a California resident, you have additional rights under the California 
                  Consumer Privacy Act (CCPA):
                </p>
                
                <h3 className="text-xl font-semibold text-zebra-black mb-3">7.1 Categories of Personal Information Collected</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Identifiers (name, email, IP address)</li>
                  <li>Commercial information (transaction history, services purchased)</li>
                  <li>Internet activity (browsing history, search history, interaction with our Services)</li>
                  <li>Professional information (company name, job title)</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">7.2 Your CCPA Rights</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Right to Know:</strong> Request disclosure of personal information collected, used, and shared</li>
                  <li><strong>Right to Delete:</strong> Request deletion of personal information, with certain exceptions</li>
                  <li><strong>Right to Opt-Out:</strong> We do not sell personal information, but you can opt-out of certain sharing</li>
                  <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
                </ul>

                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise your CCPA rights, contact us at privacy@zebamail.com or call 1-800-ZEBAMAIL. 
                  We may need to verify your identity before processing your request.
                </p>
              </section>

              {/* European Privacy Rights (GDPR) */}
              <section id="european-privacy" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">8. European Privacy Rights (GDPR)</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you are located in the European Economic Area (EEA) or United Kingdom, you have 
                  additional rights under the General Data Protection Regulation (GDPR):
                </p>

                <h3 className="text-xl font-semibold text-zebra-black mb-3">8.1 Legal Basis for Processing</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Contract:</strong> Processing necessary to perform our contract with you</li>
                  <li><strong>Legitimate Interests:</strong> Processing for our legitimate business interests</li>
                  <li><strong>Consent:</strong> Processing based on your explicit consent</li>
                  <li><strong>Legal Obligation:</strong> Processing to comply with legal requirements</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">8.2 Your GDPR Rights</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Access:</strong> Obtain confirmation and access to your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete personal data</li>
                  <li><strong>Erasure:</strong> Request deletion of personal data (&quot;right to be forgotten&quot;)</li>
                  <li><strong>Restriction:</strong> Restrict processing of your personal data</li>
                  <li><strong>Portability:</strong> Transfer your data to another service provider</li>
                  <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw previously given consent at any time</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">8.3 International Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your data may be transferred to and processed in countries outside the EEA. We ensure 
                  appropriate safeguards are in place, such as Standard Contractual Clauses, to protect 
                  your data during international transfers.
                </p>

                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise your GDPR rights or file a complaint, contact our Data Protection Officer 
                  at dpo@zebamail.com. You also have the right to lodge a complaint with your local 
                  supervisory authority.
                </p>
              </section>

              {/* Children's Privacy */}
              <section id="children-privacy" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">9. Children&apos;s Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  ZebaMail is not directed to individuals under the age of 13. We do not knowingly 
                  collect personal information from children under 13. If we become aware that we have 
                  collected personal information from a child under 13, we will take steps to delete 
                  that information as soon as possible.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  If you believe we have collected information from a child under 13, please contact us 
                  immediately at support@zebamail.com.
                </p>
              </section>

              {/* Third-Party Services */}
              <section id="third-party" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">10. Third-Party Services</h2>
                
                <h3 className="text-xl font-semibold text-zebra-black mb-3">10.1 Third-Party Links</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our Services may contain links to third-party websites or services. We are not 
                  responsible for the privacy practices of these third parties. We encourage you to 
                  review their privacy policies before providing any personal information.
                </p>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">10.2 Shopify Integration</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you connect your Shopify store to ZebaMail, you authorize us to access certain 
                  information from your Shopify account as necessary to provide our Services. Your use 
                  of Shopify is governed by Shopify&apos;s privacy policy and terms of service.
                </p>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">10.3 Analytics and Advertising</h3>
                <p className="text-gray-700 leading-relaxed">
                  We use Google Analytics to understand how our Services are used. Google Analytics 
                  collects information using cookies and similar technologies. You can opt-out of 
                  Google Analytics by installing the Google Analytics Opt-out Browser Add-on.
                </p>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">11. Cookies & Tracking</h2>
                
                <h3 className="text-xl font-semibold text-zebra-black mb-3">11.1 Types of Cookies We Use</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Essential Cookies:</strong> Required for basic site functionality and security</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how visitors use our Services</li>
                  <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Analytics Cookies:</strong> Collect aggregated data about site usage</li>
                </ul>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">11.2 Managing Cookies</h3>
                <p className="text-gray-700 leading-relaxed">
                  You can control cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                  <li>View what cookies are stored and delete them individually</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies from specific sites</li>
                  <li>Block all cookies from being set</li>
                  <li>Delete all cookies when you close your browser</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Note that blocking all cookies may impact your ability to use certain features of our Services.
                </p>

                <h3 className="text-xl font-semibold text-zebra-black mb-3 mt-6">11.3 Other Tracking Technologies</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may also use web beacons, pixel tags, and similar technologies to track usage 
                  patterns and improve our Services. These technologies help us understand user behavior 
                  and measure the effectiveness of our features.
                </p>
              </section>

              {/* Changes to Privacy Policy */}
              <section id="changes" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">12. Changes to Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, 
                  technologies, legal requirements, and other factors. When we make material changes, we will:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                  <li>Update the &quot;Last updated&quot; date at the top of this policy</li>
                  <li>Notify you by email (for registered users) or through a prominent notice on our Services</li>
                  <li>Provide a summary of the key changes</li>
                  <li>Give you the opportunity to review the changes before they take effect</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Your continued use of our Services after the effective date of the revised Privacy 
                  Policy constitutes your acceptance of the changes. If you do not agree with the 
                  revised policy, you should discontinue use of our Services.
                </p>
              </section>

              {/* Contact Information */}
              <section id="contact" className="mb-12">
                <h2 className="text-2xl font-bold text-zebra-black mb-4">13. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our 
                  privacy practices, please contact us:
                </p>
                
                <div className="bg-systematic-grey rounded-lg p-6 space-y-3">
                  <div>
                    <strong className="text-zebra-black">Email:</strong>
                    <a href="mailto:support@zebamail.com" className="text-growth-green hover:text-growth-green-600 ml-2">
                      support@zebamail.com
                    </a>
                  </div>
                  <div>
                    <strong className="text-zebra-black">Privacy Inquiries:</strong>
                    <a href="mailto:privacy@zebamail.com" className="text-growth-green hover:text-growth-green-600 ml-2">
                      privacy@zebamail.com
                    </a>
                  </div>
                  <div>
                    <strong className="text-zebra-black">Data Protection Officer:</strong>
                    <a href="mailto:dpo@zebamail.com" className="text-growth-green hover:text-growth-green-600 ml-2">
                      dpo@zebamail.com
                    </a>
                  </div>
                  <div>
                    <strong className="text-zebra-black">Mailing Address:</strong>
                    <span className="ml-2">ZebaMail, Inc., 123 Growth Street, San Francisco, CA 94105</span>
                  </div>
                  <div>
                    <strong className="text-zebra-black">Phone:</strong>
                    <span className="ml-2">1-800-ZEBAMAIL (1-800-932-2624)</span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mt-6">
                  We aim to respond to all privacy-related inquiries within 30 days. For urgent matters, 
                  please indicate &quot;URGENT&quot; in your email subject line.
                </p>
              </section>

              {/* Footer with Zebra Character */}
              <div className="mt-16 pt-8 border-t text-center">
                <ZebCharacter variant="guide" size="sm" className="mx-auto mb-4" />
                <p className="text-gray-600">
                  Thank you for trusting ZebaMail with your data. We&apos;re committed to protecting your privacy.
                </p>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons - Mobile */}
      <div className="fixed bottom-4 right-4 lg:hidden flex flex-col gap-2 noPrint">
        <Button
          onClick={scrollToTop}
          size="sm"
          className="bg-growth-green hover:bg-growth-green-600 text-white shadow-lg"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button
          onClick={handlePrint}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Printer className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}