import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZebCharacter } from '@/components/brand';
import { CheckCircle, Mail, Key, Users } from 'lucide-react';
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
          <Badge variant="secondary" className="text-sm">PRIVATE BETA</Badge>
          <p className="text-xl text-gray-600 mt-4">
            Thank you for being an early adopter!
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

        {/* What's Included */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-growth-green" />
              What's Included in Beta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-growth-green mt-0.5" />
                <span>Full access to the email template builder</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-growth-green mt-0.5" />
                <span>Unlimited template creation and editing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-growth-green mt-0.5" />
                <span>Advanced merge tags and conditional content</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-growth-green mt-0.5" />
                <span>Early access to new features</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-growth-green mt-0.5" />
                <span>Direct feedback channel to the development team</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Beta Tester Expectations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-growth-green" />
              Beta Tester Expectations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              As a beta tester, we'd love your help with:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-growth-green">•</span>
                <span>Testing features and reporting any bugs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-growth-green">•</span>
                <span>Providing feedback on user experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-growth-green">•</span>
                <span>Suggesting features that would help your business</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-growth-green">•</span>
                <span>Sharing your success stories with ZebaMail</span>
              </li>
            </ul>
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