import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const faqSections = [
    {
      title: "🛍️ Orders & Checkout",
      items: [
        {
          question: "How do I place an order?",
          answer:
            "All orders are confirmed via **WhatsApp** for now. Simply add items to your cart, proceed to checkout, and you'll be directed to WhatsApp so our team can confirm your order details, shipping, and payment.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "Currently, we accept **bank transfer only/Wise transfer (fee borne by customers)/Paypal USD**. Payment details will be shared with you during WhatsApp confirmation.",
        },
        {
          question: "Can I cancel my order?",
          answer:
            "Yes, you may cancel your order **as long as it's before payment is made**. Please inform us via WhatsApp as soon as possible so we can assist you.",
        },
      ],
    },
    {
      title: "🚚 Shipping & Delivery",
      items: [
        {
          question: "Do you ship internationally?",
          answer:
            "Yes! We ship **worldwide** 🌍\n\n- **Indonesia:** We'll select the courier for you.\n- **International orders:** You may choose your preferred courier, and shipping fees will follow the courier's rate.",
        },
        {
          question: "How long does shipping take?",
          answer:
            "- Ready-stock items are shipped within **1–3 days**.\n- Shipping time depends on your location and courier.\n\nIf you have a **specific delivery date in mind**, feel free to let us know — we'll try our best to accommodate.",
        },
        {
          question: "How much is the shipping fee?",
          answer:
            "Shipping fees are calculated based on your location, order size, and courier. The final shipping cost will be confirmed during WhatsApp order confirmation.",
        },
      ],
    },
    {
      title: "📏 Products & Sizing",
      items: [
        {
          question: "Do you offer custom sizing?",
          answer:
            "Yes! We offer **custom sizing** for all clothing that supports **pre-order**.\n\n- Custom sizing comes with an **additional charge**\n- Lead time will be **longer** than ready-stock items\n\nJust let us know your request via WhatsApp, and we'll guide you through it.",
        },
        {
          question: "What if my pet is between sizes?",
          answer:
            "We recommend choosing the **bigger size** for comfort. If you're unsure, feel free to ask us — we're happy to help you choose.",
        },
        {
          question: "Are your products ready stock or pre-order?",
          answer:
            "We offer a mix of:\n\n- **Ready-stock items** (ship within 1–3 days)\n- **Pre-order items** (lead time 1–3 weeks, depending on the product)\n\nProduct availability is stated on each product page.",
        },
      ],
    },
    {
      title: "🔄 Returns & Exchanges",
      items: [
        {
          question: "Do you accept returns or exchanges?",
          answer:
            "We do **not accept returns or exchanges**, as all items are carefully checked before shipping. However, if you receive a **defective item**, please contact us immediately via WhatsApp so we can assist you.",
        },
        {
          question: "Can custom or pre-order items be returned?",
          answer:
            "No. **Custom-sized and pre-order items are non-returnable**.",
        },
      ],
    },
    {
      title: "🤝 Reseller & White Label",
      items: [
        {
          question: "How do I become a reseller?",
          answer:
            "To access reseller pricing, please **register via WhatsApp**. Our team will guide you through the registration and explain the reseller scheme.",
        },
        {
          question: "Is there a minimum order quantity (MOQ)?",
          answer:
            "Yes. MOQ details are **stated on each product page** and may vary by item or scheme.",
        },
        {
          question: "Do you offer white labeling?",
          answer:
            "Yes, we offer **white labeling services** with a minimum order quantity. White labeling includes custom designs and branding, and is handled on a **case-by-case basis**. Please contact us via WhatsApp for consultation.",
        },
      ],
    },
  ];

  // Helper to format markdown-style text
  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Replace **text** with bold
      const formatted = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <span key={i}>
          {formatted}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-orange-400 to-orange-500 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge className="bg-white text-primary mb-4">FAQ</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              🐾 Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Find answers to the most common questions about our products,
              orders, and services.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <AccordionItem
                    key={itemIndex}
                    value={`${sectionIndex}-${itemIndex}`}
                    className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed pb-4">
                      {formatText(item.answer)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* Need Help Section */}
          <div className="mt-16 bg-gradient-to-br from-primary/10 via-orange-50 to-primary/10 rounded-2xl p-8 md:p-12 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-primary/20 p-4 rounded-full">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                💬 Need Help?
              </h3>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Still have questions?
              </p>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                👉 <strong>Chat with us on WhatsApp</strong> — we're always
                happy to help you and your pawfriends 🐾💛
              </p>
              <Link
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
