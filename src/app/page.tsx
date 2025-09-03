import BackInStock from "@/components/landing-page/back-in-stock";
import FeaturedCategory from "@/components/landing-page/featured-category";
import FeaturedProduct from "@/components/landing-page/featured-product";
import HeroSection from "@/components/landing-page/hero-section";
import OurGalery from "@/components/landing-page/our-galery";
import ResellerProgramHighlight from "@/components/landing-page/reseller-program-highlight";
import Testimonial from "@/components/landing-page/testimonial";
import WhyPawship from "@/components/landing-page/why-pawship";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProduct />
      <FeaturedCategory />
      <BackInStock />
      <WhyPawship />
      <OurGalery />
      <Testimonial />
      <ResellerProgramHighlight />
    </>
  );
}
