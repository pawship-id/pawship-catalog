import SliderFeaturedProduct from "./slider-featured-product";

export default function FeaturedProduct() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Featured Products 🐾
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect picks for you and your pets
          </p>
        </div>

        {/* Slider Featured Product */}
        <SliderFeaturedProduct />
      </div>
    </section>
  );
}
