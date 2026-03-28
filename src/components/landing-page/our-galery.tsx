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
            Meet our Pawfriends — happy, confident pets who trust Pawship every
            day
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-4 gap-4">
          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774511864/IMG_1_efv0om.jpg"
                alt="Gallery 1"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="relative w-full h-52 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774512547/IMG_2_uoxbc4.jpg"
                alt="Gallery 2"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-120 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774512437/IMG_4_gunukc.jpg"
                alt="Gallery 3"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-52 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774511912/IMG_3_qoovax.jpg"
                alt="Gallery 4"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774512459/IMG_8_pi0heo.jpg"
                alt="Gallery 5"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-44 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774512461/IMG_9_yvdu9w.jpg"
                alt="Gallery 6"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="relative w-full h-72 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774512458/IMG_6_zf933j.jpg"
                alt="Gallery 7"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774512295/IMG_5_isdo2p.jpg"
                alt="Gallery 8"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774512459/IMG_7_a0txug.jpg"
                alt="Gallery 9"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774515335/IMG_11_guti0f.jpg"
                alt="Gallery 10"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/deqpnzfwb/image/upload/v1774515357/IMG_10_t1ftpf.png"
                alt="Gallery 11"
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
