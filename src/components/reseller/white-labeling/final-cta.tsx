import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FinalCTAProps {
  onSetShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FinalCTA({ onSetShowForm }: FinalCTAProps) {
  return (
    <section className="pt-10 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="relative rounded-2xl lg:rounded-l-2xl lg:rounded-r-none overflow-hidden">
              <Image
                src="/images/galery/small-dog-with-harness-sitting-by-kitchen-counter.png"
                alt="Reseller Program"
                width={600}
                height={400}
                className="w-full object-cover aspect-3/2"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-5">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Ready to Launch{" "}
              <span className="text-primary">Your Own Pet Brand?</span>
            </h2>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Let’s make your vision a reality with our exclusive white-labeling
              service. Whether you’re starting small or aiming big, we’ll help
              you every step of the way.
            </p>

            <Button
              onClick={() => onSetShowForm(true)}
              size="lg"
              className="rounded-lg bg-primary/90 hover:bg-primary text-white text-base font-semibold px-5 py-6"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Book a Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
