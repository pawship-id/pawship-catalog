import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { RocketIcon } from "lucide-react";

export default function ResellerProgramHighlight() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div
          className="text-center rounded-3xl p-10"
          style={{
            background: `linear-gradient(to right, #F69784, #FBBD87)`,
          }}
        >
          <div className="bg-background rounded-2xl shadow-lg p-15 max-w-2xl mx-auto">
            <h2 className="text-3xl text-foreground font-bold mb-4">
              Partner With Us & Unlock Exclusive Deals
            </h2>

            <p className="text-lg text-muted-foreground mb-6">
              Want to{" "}
              <span className="text-primary font-bold">sell our products?</span>{" "}
              Join our reseller program and enjoy exclusive pricing.
            </p>

            <Button
              asChild
              size="lg"
              className="rounded-xl border border-primary bg-primary/85 text-white hover:bg-primary hover:text-white font-semibold"
            >
              <Link href="/">
                Join Now
                <span>
                  <RocketIcon className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
