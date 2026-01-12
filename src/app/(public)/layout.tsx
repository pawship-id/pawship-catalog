import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import NavigationHeader from "@/components/navigation-header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import FloatingButtonWA from "@/components/floating-button-wa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Pawship - Dog & Cat Clothing Store | Comfortable & Stylish Pet Wear",
    template: "%s | Pawship",
  },
  description:
    "Explore a wide selection of dog and cat clothing made with pet-friendly materials. Perfect for daily wear, photoshoots, and special moments.",
  keywords: [
    "pawship",
    "pet clothing",
    "pet fashion",
    "pet accessories",
    "pet equipment",
    "pet shop",
  ],
  authors: [{ name: "Pawship" }],
  creator: "Pawship",
  publisher: "Pawship",
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
    locale: "id_ID",
    url: "https://pawship.id",
    siteName: "Pawship",
    title:
      "Pawship - Dog & Cat Clothing Store | Comfortable & Stylish Pet Wear",
    description:
      "Explore a wide selection of dog and cat clothing made with pet-friendly materials. Perfect for daily wear, photoshoots, and special moments.",
    images: [
      {
        url: "https://pawship.id/images/transparent-logo.png",
        width: 2123,
        height: 1756,
        alt: "Pawship - Dog & Cat Clothing Store | Comfortable & Stylish Pet Wear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Pawship - Dog & Cat Clothing Store | Comfortable & Stylish Pet Wear",
    description:
      "Explore a wide selection of dog and cat clothing made with pet-friendly materials. Perfect for daily wear, photoshoots, and special moments.",
    images: ["https://pawship.id/images/transparent-logo.png"],
  },
  metadataBase: new URL("https://pawship.id"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          <NavigationHeader />
          <main className="flex-grow">{children}</main>
          <FloatingButtonWA />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
