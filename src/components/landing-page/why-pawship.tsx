import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Heart, Sparkles, Target, Users } from "lucide-react";

export default function WhyPawship() {
  const whyPawshipContent = [
    {
      id: 1,
      title: "Comfort Meets Style",
      description:
        "Every product is thoughtfully made to keep your pet comfy while looking adorable",
      icon: Sparkles,
    },
    {
      id: 2,
      title: "Trusted by Pawrents Everywhere",
      description:
        "Sold over 10,000+ products worldwide to community who cares for their pets like family",
      icon: Users,
    },
    {
      id: 3,
      title: "Created for all breeds",
      //   description:
      //     "Our designs are thoughtfully made to fit small to large breeds — from toy poodles to golden retrievers. We offer adjustable sizing and flexible fabrics mean every pet can enjoy comfort and style without compromise",
      description:
        "Our designs are thoughtfully made to fit small to large breeds — from toy poodles to golden retrievers.",
      icon: Heart,
    },
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div
          className="text-primary-foreground rounded-3xl p-15"
          style={{ background: `linear-gradient(to right, #F69784, #FBBD87)` }}
        >
          <div className="space-y-2 text-center mb-10">
            <h2 className="text-3xl font-bold">Why Pawship</h2>
            <p className="text-lg max-w-2xl mx-auto">
              From Indonesia to the world, we carefully craft every collection
              and design to create comfort and stronger bonds between Pawrents
              and Pawfriends.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyPawshipContent.map((item, idx) => {
              const Icon = item.icon;

              return (
                <Card
                  className="bg-primary-foreground text-foreground"
                  key={idx}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <span>{item.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
