import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/hooks/use-auth"
import { ErrorBoundary } from "@/components/error-boundary"
import Script from "next/script"
import { organizationSchema, websiteSchema } from "@/lib/seo"
import { SkipToMain } from "@/lib/accessibility"
import { CurrencyProvider } from "@/lib/currency-context"

declare global {
  interface Window {
    gtag: any
  }
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: {
    default: "JJ Enterprises - Premium Paper Box Packaging Solutions | Custom Corrugated Boxes India",
    template: "%s | JJ Enterprises - Paper Packaging Solutions",
  },
  description:
    "Leading manufacturer of custom paper box packaging solutions in India. Specializing in corrugated boxes, pharmaceutical packaging, food-grade boxes, luxury gift boxes with 3D configurator. ISO 9001:2015 certified with 15+ years experience.",
  keywords: [
    "paper packaging India",
    "custom paper boxes",
    "corrugated paper boxes Mumbai",
    "pharmaceutical paper packaging",
    "food grade paper boxes",
    "luxury paper gift boxes",
    "3D packaging configurator",
    "eco-friendly paper packaging",
    "folding cartons India",
    "paper box manufacturer Mumbai",
    "custom packaging solutions",
    "paper packaging supplier",
    "sustainable packaging India",
    "paper box printing",
    "packaging design services",
  ].join(", "),
  authors: [{ name: "JJ Enterprises", url: "https://jjenterprises.com" }],
  creator: "JJ Enterprises",
  publisher: "JJ Enterprises",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://jjenterprises.com",
    title: "JJ Enterprises - Premium Paper Box Packaging Solutions | Custom Corrugated Boxes India",
    description:
      "Leading manufacturer of custom paper box packaging solutions in India. ISO 9001:2015 certified with 15+ years experience. Specializing in corrugated boxes, pharmaceutical packaging, and luxury gift boxes.",
    siteName: "JJ Enterprises",
    images: [
      {
        url: "/featured_corrugated_shipping_paper_box.png",
        width: 1200,
        height: 630,
        alt: "JJ Enterprises Custom Paper Box Packaging Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JJ Enterprises - Premium Paper Box Packaging Solutions",
    description:
      "Leading manufacturer of custom paper box packaging solutions in India. ISO 9001:2015 certified with 15+ years experience.",
    images: ["/featured_corrugated_shipping_paper_box.png"],
    creator: "@jjenterprises",
    site: "@jjenterprises",
  },
  generator: "Next.js",
  applicationName: "JJ Enterprises Packaging Solutions",
  referrer: "origin-when-cross-origin",
  category: "Manufacturing",
  classification: "Business",
  alternates: {
    canonical: "https://jjenterprises.com",
    languages: {
      "en-IN": "https://jjenterprises.com",
      "hi-IN": "https://jjenterprises.com/hi",
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    }
    : undefined,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JJ Enterprises",
  },
  other: {
    "msapplication-TileColor": "#f97316",
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SkipToMain />
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <CurrencyProvider>
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1" id="main-content">
                    {children}
                  </main>
                  <Footer />
                </div>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "white",
                      border: "1px solid #e5e7eb",
                      color: "#374151",
                    },
                  }}
                />
              </CurrencyProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>

        {/* Analytics Scripts - Only load if GA_MEASUREMENT_ID is configured */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}

        {/* Performance monitoring */}
      </body>
    </html>
  )
}

// Helper function to send metrics to Google Analytics
function sendToAnalytics(metric: { name: string; value: number; id: string; label: string }) {
  // Ensure gtag is available before attempting to use it.
  // It's defined by the Google Analytics script.
  if (typeof window.gtag === "function") {
    window.gtag("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value), // CLS value is a decimal, convert to ms
      event_label: metric.id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate
      event_category: "Web Vitals", // Optional: for categorizing events
    })
  }
}

// This function will be called by Next.js with the web vitals metrics
export function reportWebVitals(metric: any) {
  // You can use a more specific type if you install 'web-vitals' as a dev dependency for types
  // You can send the metrics to an analytics endpoint or log them
  // Metric logging is handled by reportWebVitals function
  sendToAnalytics(metric)
}
