import SingleBanner from "@/components/common/single-banner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default function AboutUsPage() {
  const steps = [
    {
      title: "Add items to your cart",
      description: "Make sure the items and currency are correct",
      details: [
        "The currency you use shall be the same with the shipping address",
        "Hong Kong = HKD",
        "Asia countries other than Hong Kong = SGD",
        "Indonesia = IDR",
        "Others = USD",
      ],
    },
    {
      title: "Complete your checkout process",
      description: 'Until "Confirm order via Whatsapp"',
      details: [
        "All payment and shipping fee will be finalized in Whatsapp for a faster and more secure payment",
        "Fill in shipping details",
        "Choose Manual Payment",
        'Click "Confirm order via Whatsapp" and send your order summary in whatsapp',
      ],
    },
    {
      title: "Receive payment instructions",
      description: "Get final amount and payment details",
      details: [
        "Once confirmed by our team, you will receive the final amount and payment instruction through Whatsapp",
      ],
      bankAccount: [
        {
          paymentName: "IDR",
          bankName: "Bank Central Asia",
          accountHolderName: "Yosefina Angelita",
          accountNumber: "1520675597",
        },
        {
          paymentName: "SGD/HKD via Wise",
          bankName: "Bank Central Asia",
          accountHolderName: "Yosefina Angelita",
          accountNumber: "1520675597",
          Address:
            "Klampis Jaya A6 , Klampis, Keputih, Surabaya, East Java 60111",
          email: "pawship.id@gmail.com",
        },
        {
          paymentName: "USD via Paypal",
          accountHolderName: "Yosefina Angelita",
          email: "pawship.id@gmail.com",
        },
      ],
    },
    {
      title: "Upload proof via Website/Chat",
      description: "Submit your payment confirmation",
      details: [
        "Upload manual payment proof using the form below",
        "Include your order ID and payment details",
      ],
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <SingleBanner page="payment">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Overlay hitam */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary text-primary-foreground">
              Payments
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Payment <span className="text-primary">Guide</span>
            </h1>
            <p className="text-lg lg:text-xl">
              This guide will help you finish your transaction smoothly.
            </p>
          </div>
        </div>
      </SingleBanner>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-4 text-center mb-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              Payment Tutorial 🐾
            </h2>
            <p className="md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow the payment steps below to complete your transaction easily
              and securely at Pawship
            </p>
          </div>

          <div className="flex items-center justify-center mt-10 max-w-5xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {steps.map((step, index) => (
                <AccordionItem key={index} value={`step-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex gap-4 items-center text-left">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 md:w-13 md:h-13 text-lg rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-foreground text-lg md:text-xl">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground md:text-base">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 mx-6 md:ml-16 md:mr-0 mt-2">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="md:text-base text-muted-foreground leading-relaxed"
                        >
                          • {detail}
                        </li>
                      ))}
                    </ul>

                    {step.bankAccount && (
                      <div className="mt-2 mx-6 md:ml-16 md:mr-0">
                        <p className="md:text-base text-muted-foreground leading-relaxed">
                          We only receive payments sent to the following bank
                          account
                        </p>
                        {step.bankAccount.map((bank, item) => (
                          <ol
                            key={item}
                            className="md:text-base text-muted-foreground leading-relaxed"
                          >
                            <li className="mt-4 ">
                              <span className="font-bold">
                                {item + 1}. {bank.paymentName}
                              </span>
                              <ul className="ml-4 mt-1 space-y-1">
                                {bank.accountNumber && (
                                  <li>
                                    <span className="font-semibold">
                                      Bank Name
                                    </span>
                                    : {bank.bankName}
                                  </li>
                                )}
                                <li>
                                  <span className="font-semibold">
                                    Account Holder
                                  </span>
                                  : {bank.accountHolderName}
                                </li>
                                {bank.accountNumber && (
                                  <li>
                                    <span className="font-semibold">
                                      Account Number
                                    </span>
                                    : {bank.accountNumber}
                                  </li>
                                )}
                                {bank.Address && (
                                  <li>
                                    <span className="font-semibold">
                                      Address
                                    </span>
                                    : {bank.Address}
                                  </li>
                                )}
                                {bank.email && (
                                  <li>
                                    <span className="font-semibold">Email</span>
                                    : {bank.email}
                                  </li>
                                )}
                              </ul>
                            </li>
                          </ol>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* <div className="mt-8">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="bank-accounts">
                  <AccordionTrigger className="p-4 bg-secondary rounded-lg border border-border hover:no-underline">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Accepted Bank Accounts
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      <BankAccountCard
                        currency="IDR"
                        bankName="Bank Central Asia"
                        accountHolder="Yosefina Angelita"
                        accountNumber="1520675597"
                        expense="Free (No additional fees)"
                      />
                      <BankAccountCard
                        currency="SGD/HKD via Wise"
                        bankName="Bank Central Asia"
                        accountHolder="Yosefina Angelita"
                        accountNumber="1520675597"
                        address="Klampis Jaya A6, Klampis, Keputih, Surabaya, East Java 60111"
                        email="pawship.id@gmail.com"
                        expense="Wise transfer fees apply (varies by amount)"
                      />
                      <BankAccountCard
                        currency="USD via Paypal"
                        name="Yosefina Angelita"
                        email="pawship.id@gmail.com"
                        expense="PayPal fees: 4.4% + fixed fee"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}
