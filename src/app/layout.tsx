import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppProvider";
import { CartSidebar } from "@/components/cart/CartSidebar";

export const metadata: Metadata = {
  title: "Ajebo Tailor - Premium Fashion",
  description: "Discover premium fashion with Ajebo Tailor. Shop the latest collections for men, women, and kids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          {children}
          <CartSidebar />
        </AppProvider>
      </body>
    </html>
  );
}
