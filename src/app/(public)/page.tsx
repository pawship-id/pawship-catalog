import BackInStock from "@/components/landing-page/back-in-stock";
import ConnectWithUs from "@/components/landing-page/connect-with-us";
import FeaturedCategory from "@/components/landing-page/featured-category";
import FeaturedProduct from "@/components/landing-page/featured-product";
import HeroSection from "@/components/landing-page/hero-section";
import HomeBannerCarousel from "@/components/landing-page/home-banner-carousel";
import LatestReels from "@/components/landing-page/latest-reels";
import OurGalery from "@/components/landing-page/our-galery";
import ResellerProgramHighlight from "@/components/landing-page/reseller-program-highlight";
import Testimonial from "@/components/landing-page/testimonial";
import WhyPawship from "@/components/landing-page/why-pawship";

export default function Home() {
  return (
    <>
      {/* <HeroSection /> */}
      <HomeBannerCarousel page="home" />
      <FeaturedProduct />
      <FeaturedCategory />
      <BackInStock />
      <WhyPawship />
      <OurGalery />
      <Testimonial />
      <ResellerProgramHighlight />
      <ConnectWithUs />
      <LatestReels />
    </>
  );
}
