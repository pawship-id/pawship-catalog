import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AboutUsPage() {
  const whyPawshipContent = [
    {
      id: 1,
      title: "Designed for All Breeds",
      description: "Clothes that fit comfortably across sizes and shapes.",
      icon: "🐾",
    },
    {
      id: 2,
      title: "Ethically Handmade",
      description: "Crafted with love and care from Indonesia",
      icon: "✨",
    },
    {
      id: 3,
      title: "Friendship First",
      description:
        "Celebrating the unbreakable bond between pawrents and pawfriends.",
      icon: "🌍",
    },
    {
      id: 4,
      title: "Wellbeing Matters",
      description: "Every piece prioritizes your pet's comfort and happiness.",
      icon: "❤️",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/ec/f5/05/ecf50550fafb06444490098000a1af65.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Overlay hitam */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary text-primary-foreground">
              About Us
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Pawship - Where <span className="text-primary">Paws</span> Meet{" "}
              <span className="text-primary">Friendship</span>
            </h1>
            <p className="text-lg lg:text-xl">
              Your Pawfriends Deserve the Best
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-300/20 rounded-3xl transform rotate-6"></div>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="https://i.pinimg.com/1200x/0f/41/82/0f4182d09adb53e3ef70131ffde3b35e.jpg"
                  alt="Our Community"
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Our Story
                </h2>
                <p className="md:text-lg text-gray-700">
                  At <span className="font-semibold">Pawship</span>, we believe
                  friendship with your pets deserves to be celebrated with
                  comfort, care, and style.
                </p>
                <p className="md:text-lg text-gray-700">
                  The name <em>Pawship</em> comes from{" "}
                  <span className="font-semibold">paws + friendship</span>
                  —because your pawfriends are family, and that bond is the
                  heart of everything we do.
                </p>
                <p className="md:text-lg text-gray-700">
                  Our promise is simple: ✨{" "}
                  <span className="font-semibold">
                    Your Pawfriends Deserve the Best.
                  </span>{" "}
                  ✨ That's why every piece is{" "}
                  <span className="font-semibold">ethically handmade</span>,
                  with fabrics and designs that keep pets feeling safe,
                  comfortable, and stylish.
                </p>
                <div className="text-center pt-5">
                  <p className="text-xl md:text-2xl font-serif italic text-primary flex items-center justify-center gap-2">
                    - Celebrating friendship, caring for every paws.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div
            className="text-primary-foreground rounded-3xl p-15"
            style={{
              background: `linear-gradient(to right, #F69784, #FBBD87)`,
            }}
          >
            <div className="space-y-2 text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Our Promise
              </h2>
              <p className="text-lg max-w-2xl mx-auto">
                We’re more than just pet fashion. At Pawship, we stand for:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyPawshipContent.map((item, idx) => {
                return (
                  <Card
                    className="bg-primary-foreground text-foreground"
                    key={idx}
                  >
                    <CardHeader>
                      <CardTitle className="flex flex-col items-center space-y-3 text-center">
                        <span className="text-4xl">{item.icon}</span>
                        <span className="text-lg">{item.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Our Community */}
      <section className="pt-10 pb-20  md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 lg:order-1">
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Our Community
                </h2>
                <div className="space-y-4">
                  <p className="md:text-lg text-gray-700 leading-relaxed">
                    Today, Pawship is trusted by pawrents and resellers across{" "}
                    <Badge variant="secondary" className="mx-1">
                      🇮🇩 Indonesia
                    </Badge>
                    ,{" "}
                    <Badge variant="secondary" className="mx-1">
                      🇭🇰 Hong Kong
                    </Badge>
                    , and{" "}
                    <Badge variant="secondary" className="mx-1">
                      🇸🇬 Singapore
                    </Badge>
                    .
                  </p>
                  <p className="md:text-lg text-gray-700 leading-relaxed">
                    Whether you're shopping for your own pets or building your
                    pet business with us, you're joining a growing family that
                    believes every pawfriend deserves comfort and joy.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-300/20 rounded-3xl transform rotate-6"></div>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="https://i.pinimg.com/736x/d0/dc/b6/d0dcb683a3d082cc1098f0aab92705d6.jpg"
                  alt="Our Community"
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values in Action */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Our Values in Action
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-4">
                We run campaigns that give back to shelters and support pets in
                need. With every product you choose, you're helping us share
                care and comfort—one paw at a time.
              </p>
              <p className="text-lg text-primary font-medium italic">
                Because every paw deserves love.
              </p>
            </div>
          </div>

          {/* Campaign Images with Enhanced Layout */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-400/20 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src="/images/galery/pet-shelter-donation-campaign-with-happy-rescued-d.jpg"
                    alt="Shelter donation campaign"
                    className="h-80 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Shelter Support</h3>
                    <p className="text-sm opacity-90">
                      Helping rescued pets find comfort
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300/20 to-primary/20 rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src="/images/galery/volunteers-helping-pets-at-animal-shelter.jpg"
                    alt="Community giving back"
                    className="h-80 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Community Care</h3>
                    <p className="text-sm opacity-90">
                      Volunteers making a difference
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Join us in celebrating friendship, style, and wellbeing for pets
                everywhere.
              </h2>
              <p className="text-xl text-primary font-medium">
                Your Pawfriends Deserve the Best.
              </p>
              <p className="text-lg text-muted-foreground italic">
                "Celebrating friendship, caring for every paw."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="px-8 py-6 text-base group cursor-pointer bg-primary/90 hover:bg-primary"
              >
                🛍️ Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg group cursor-pointer hover:bg-primary/90 hover:text-white"
              >
                🤝 Become a Reseller
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="pt-6 border-t border-primary/20 mt-12">
              <p className="text-base text-muted-foreground italic">
                From our paws to theirs—sharing comfort, one friend at a time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
