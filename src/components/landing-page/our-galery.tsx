import React from "react";

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
            <img
              src="/images/galery/orange-tabby-cat-resting-peacefully-on-carpet.png"
              alt="Orange tabby cat"
              className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
            <img
              src="/images/galery/small-dog-with-harness-sitting-by-kitchen-counter.png"
              alt="Small dog with harness"
              className="w-full h-52 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-4">
            <img
              src="/images/galery/happy-woman-hugging-white-poodle-on-yellow-couch.png"
              alt="Woman with poodle"
              className="w-full h-120 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-4">
            <img
              src="/images/galery/small-fluffy-dog-standing-in-modern-kitchen.png"
              alt="Small fluffy dog"
              className="w-full h-52 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
            <img
              src="/images/galery/happy-pets-and-animals-in-a-shelter-with-volunteer.png"
              alt="Man with parrot"
              className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-4">
            <img
              src="/images/galery/cats-eating-from-food-bowls-on-floor.png"
              alt="Cats eating"
              className="w-full h-44 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
            <img
              src="/images/galery/corgi-dog-eating-from-food-bowl-with-kibble-scatte.png"
              alt="Corgi eating"
              className="w-full h-72 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-4">
            <img
              src="/images/galery/orange-tabby-cat-resting-peacefully-on-carpet.png"
              alt="Orange tabby cat"
              className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-4">
            <img
              src="/images/galery/small-dog-with-harness-sitting-by-kitchen-counter.png"
              alt="Small dog with harness"
              className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-4">
            <img
              src="/images/galery/cats-eating-from-food-bowls-on-floor.png"
              alt="Small dog with harness"
              className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-4">
            <img
              src="/images/galery/small-fluffy-dog-standing-in-modern-kitchen.png"
              alt="Small dog with harness"
              className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
