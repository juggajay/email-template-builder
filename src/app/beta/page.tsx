import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZebCharacter } from '@/components/brand';
import { CheckCircle, Mail, Key, Users, Gift, Clock, DollarSign, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function BetaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-systematic-grey to-growth-green/10 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <ZebCharacter variant="default" size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-zebra-black mb-2">
            Welcome to ZebaMail Beta
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="text-sm">PRIVATE BETA</Badge>
            <Badge variant="destructive" className="text-sm">92% FULL</Badge>
          </div>
          <p className="text-xl text-gray-600">
            Join the exclusive group shaping the future of e-commerce email marketing
          </p>
        </div>

        {/* Beta Access Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-growth-green" />
              How to Access ZebaMail Beta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Option 1: Use Your Invite Code</h3>
              <ol className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-growth-green font-semibold">1.</span>
                  <span>Click "Get Started" below or go to the <Link href="/signup" className="text-growth-green hover:underline">signup page</Link></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-growth-green font-semibold">2.</span>
                  <span>Fill in your details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-growth-green font-semibold">3.</span>
                  <span>Enter your beta invite code in the format: <code className="bg-gray-100 px-2 py-1 rounded">BETA-XXXXXXXX</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-growth-green font-semibold">4.</span>
                  <span>Complete signup and start using ZebaMail!</span>
                </li>
              </ol>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Option 2: Pre-Approved Email</h3>
              <p className="text-gray-600">
                If your email was pre-approved, simply sign up with that email address. 
                No invite code needed!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Beta Benefits */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-growth-green/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="w-5 h-5 text-growth-green" />
                Exclusive Beta Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-growth-green mt-0.5" />
                  <div>
                    <span className="font-semibold">2 Weeks Free Access</span>
                    <p className="text-sm text-gray-600">Full platform access with no credit card required</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-growth-green mt-0.5" />
                  <div>
                    <span className="font-semibold">50% Lifetime Discount</span>
                    <p className="text-sm text-gray-600">Lock in founder pricing forever</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 text-growth-green mt-0.5" />
                  <div>
                    <span className="font-semibold">Direct Dev Access</span>
                    <p className="text-sm text-gray-600">Private Slack channel with our team</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-growth-green mt-0.5" />
                  <div>
                    <span className="font-semibold">Feature Requests</span>
                    <p className="text-sm text-gray-600">Your ideas become our roadmap</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-success-purple/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-success-purple" />
                What's Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-purple mt-0.5" />
                  <span>Full email template builder access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-purple mt-0.5" />
                  <span>20+ pre-built e-commerce templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-purple mt-0.5" />
                  <span>Advanced merge tags & personalization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-purple mt-0.5" />
                  <span>Export to Klaviyo, Mailchimp & more</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-purple mt-0.5" />
                  <span>Priority support & onboarding</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Beta Tester Expectations */}
        <Card className="mb-8 border-2 border-growth-green/20 bg-growth-green/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-growth-green" />
              What We Expect From Beta Testers
            </CardTitle>
            <CardDescription>
              Help us build the perfect email marketing tool for e-commerce
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-zebra-black">Your Commitment</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-growth-green">✓</span>
                    <span><strong>Weekly feedback</strong> via our feedback form</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-growth-green">✓</span>
                    <span><strong>Test templates</strong> with real campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-growth-green">✓</span>
                    <span><strong>Report bugs</strong> and UX improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-growth-green">✓</span>
                    <span><strong>Share testimonials</strong> and case studies</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-zebra-black">How We'll Connect</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-success-purple">•</span>
                    <span><strong>Private Slack community</strong> for instant support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-purple">•</span>
                    <span><strong>Weekly office hours</strong> with founders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-purple">•</span>
                    <span><strong>Feature request voting</strong> system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-purple">•</span>
                    <span><strong>Early access</strong> to new features</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Active participation is required. Beta testers who don't engage for 2+ weeks may have their access revoked to make room for others.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card className="border-growth-green/20 bg-growth-green/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-growth-green" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have any questions or issues accessing the beta:
            </p>
            <ul className="space-y-2 text-sm">
              <li>• Email us at: <a href="mailto:beta@zebamail.com" className="text-growth-green hover:underline">beta@zebamail.com</a></li>
              <li>• Include your invite code (if you have one)</li>
              <li>• We'll get back to you within 24 hours</li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started with Beta
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Already have access? Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}