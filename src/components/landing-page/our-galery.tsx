import React from "react";
import Image from "next/image";

export default function OurGalery() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">
            Our Furry Friends 🐾
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet some of the amazing animals we've helped find their forever
            homes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-4 gap-4">
          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/orange-tabby-cat-resting-peacefully-on-carpet.png"
                alt="Orange tabby cat"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="relative w-full h-52 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/small-dog-with-harness-sitting-by-kitchen-counter.png"
                alt="Small dog with harness"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-120 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/happy-woman-hugging-white-poodle-on-yellow-couch.png"
                alt="Woman with poodle"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-52 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/small-fluffy-dog-standing-in-modern-kitchen.png"
                alt="Small fluffy dog"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/happy-pets-and-animals-in-a-shelter-with-volunteer.png"
                alt="Man with parrot"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-44 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/cats-eating-from-food-bowls-on-floor.png"
                alt="Cats eating"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="relative w-full h-72 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/corgi-dog-eating-from-food-bowl-with-kibble-scatte.png"
                alt="Corgi eating"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/orange-tabby-cat-resting-peacefully-on-carpet.png"
                alt="Orange tabby cat"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/small-dog-with-harness-sitting-by-kitchen-counter.png"
                alt="Small dog with harness"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/cats-eating-from-food-bowls-on-floor.png"
                alt="Cats eating"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/galery/small-fluffy-dog-standing-in-modern-kitchen.png"
                alt="Small fluffy dog"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
