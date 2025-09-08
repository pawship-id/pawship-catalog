import React from "react";
import { Button } from "../ui/button";
import { RocketIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="pt-10 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="relative rounded-l-2xl overflow-hidden">
              <Image
                src="/images/banner/happy-dogs-wearing-stylish-collars-and-accessories.png"
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
              Ready to Become{" "}
              <span className="text-primary">Our Reseller?</span>
            </h2>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Join hundreds of successful partners already growing their
              businesses with our premium pet products.
            </p>

            <Button
              asChild
              size="lg"
              className="rounded-lg bg-primary hover:bg-primary/90 text-white text-base font-semibold px-5 py-6"
            >
              <Link href="/reseller" className="flex items-center gap-2">
                Apply Now
                <RocketIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
