import { Link } from "wouter";
import { Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight" data-testid="text-privacy-title">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Card className="p-6 sm:p-8 space-y-8">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground" data-testid="text-privacy-effective-date">
              Effective Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              PlainLegal ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
          </div>

          <section className="space-y-3" data-testid="section-information-collected">
            <h2 className="text-base font-semibold">1. Information We Collect</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p><span className="font-medium text-foreground">Account Information:</span> When you create an account, we collect your email address, display name, and a securely hashed version of your password. We never store plaintext passwords.</p>
              <p><span className="font-medium text-foreground">Document Data:</span> When you submit legal documents for analysis, we temporarily store the document text and the AI-generated analysis results. Documents are associated with your user account.</p>
              <p><span className="font-medium text-foreground">Usage Data:</span> We track the number of analyses you perform each month for rate limiting purposes. We also collect session data to keep you logged in.</p>
              <p><span className="font-medium text-foreground">Device Information:</span> We may collect basic device and browser information through standard web server logs.</p>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-ai-processing">
            <h2 className="text-base font-semibold">2. AI Processing & Third-Party Services</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>PlainLegal uses <span className="font-medium text-foreground">DigitalOcean Gradient AI</span> (powered by Meta Llama 3.3 70B) to analyze your legal documents. When you submit a document for analysis:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your document text is sent to DigitalOcean's AI inference API for processing.</li>
                <li>The AI generates a plain English translation, risk analysis, key terms, and other insights.</li>
                <li>AI processing is subject to DigitalOcean's privacy and data handling policies.</li>
                <li>We do not use your documents to train AI models.</li>
              </ul>
              <p>For document scanning (OCR), images are processed through DigitalOcean Gradient AI's vision capabilities to extract text before analysis.</p>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-cookies">
            <h2 className="text-base font-semibold">3. Cookies & Session Data</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>We use session cookies to maintain your authentication state. These cookies are essential for the application to function and cannot be disabled. We do not use tracking cookies or third-party analytics cookies.</p>
              <p>Session data is stored server-side and includes your user ID for authentication purposes. Sessions expire after a period of inactivity.</p>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-data-storage">
            <h2 className="text-base font-semibold">4. Data Storage & Security</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>Your data is stored in a PostgreSQL database. We implement reasonable security measures to protect your information, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Password hashing using bcrypt with appropriate salt rounds.</li>
                <li>Secure session management with HTTP-only cookies.</li>
                <li>Database access controls and encryption at rest.</li>
              </ul>
              <p>While we strive to protect your data, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.</p>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-data-use">
            <h2 className="text-base font-semibold">5. How We Use Your Information</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve the PlainLegal service.</li>
                <li>Process your legal documents through AI analysis.</li>
                <li>Manage your account and authentication.</li>
                <li>Enforce rate limits on free-tier usage.</li>
                <li>Communicate with you about service updates or issues.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-data-sharing">
            <h2 className="text-base font-semibold">6. Data Sharing</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>We do not sell, trade, or rent your personal information. We may share your data only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><span className="font-medium text-foreground">AI Processing:</span> Document text is shared with DigitalOcean Gradient AI for analysis purposes.</li>
                <li><span className="font-medium text-foreground">Legal Requirements:</span> We may disclose information if required by law, regulation, or legal process.</li>
                <li><span className="font-medium text-foreground">Safety:</span> We may disclose information to protect the rights, safety, or property of PlainLegal, our users, or the public.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-account-deletion">
            <h2 className="text-base font-semibold">7. Account Deletion & Data Removal</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>You have the right to delete your account at any time. When you delete your account:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All your personal information (email, display name, password hash) is permanently deleted.</li>
                <li>All documents you have submitted and their analysis results are permanently deleted.</li>
                <li>All chat messages associated with your documents are permanently deleted.</li>
                <li>This action is irreversible.</li>
              </ul>
              <p>To delete your account, use the account deletion option in your account settings or contact us directly.</p>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-childrens-privacy">
            <h2 className="text-base font-semibold">8. Children's Privacy</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>PlainLegal is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will promptly delete it.</p>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-changes">
            <h2 className="text-base font-semibold">9. Changes to This Policy</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Effective Date" at the top of this page. Your continued use of PlainLegal after changes are posted constitutes your acceptance of the updated policy.</p>
            </div>
          </section>

          <section className="space-y-3" data-testid="section-contact">
            <h2 className="text-base font-semibold">10. Contact Us</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>If you have questions about this Privacy Policy or our data practices, please contact us at:</p>
              <p className="font-medium text-foreground">support@plainlegal.app</p>
            </div>
          </section>
        </Card>
      </main>

      <footer className="border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" />
            <span>PlainLegal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">Privacy Policy</span>
            <Link href="/terms">
              <span className="hover:underline cursor-pointer" data-testid="link-terms-from-privacy">Terms of Service</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}