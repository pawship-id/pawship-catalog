import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { RocketIcon, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function ResellerProgramHighlight() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/images/galery/happy-woman-hugging-white-poodle-on-yellow-couch.png"
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
              Transform Your Business with{" "}
              {/* <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> */}
              <span className="text-primary">Exclusive Partnerships</span>
            </h2>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Want to{" "}
              <span className="font-bold text-primary">sell our products?</span>{" "}
              Join our reseller program and enjoy exclusive pricing.
            </p>

            <Button
              asChild
              size="lg"
              className="rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold px-5 py-6"
            >
              <Link href="/reseller" className="flex items-center gap-2">
                Join Now
                <RocketIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
