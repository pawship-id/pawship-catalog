import { MessageSquare, Palette, Sparkles, TrendingUp } from "lucide-react";
import { WhyTrustUsContent } from "../types/reseller";

export const whyTrustUsContents: WhyTrustUsContent[] = [
  {
    id: 1,
    title: "Exclusive Designs",
    subTitle:
      "Handmade, limited collections crafted for the comfort of your pawfriends.",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "High Profit Margin",
    subTitle: "Attractive pricing structure to help your business thrive.",
    icon: TrendingUp,
  },
  {
    id: 3,
    title: "Tailored for Your Business",
    subTitle:
      "Choose from our designs or create your own collection under your brand.",
    icon: Palette,
  },
  {
    id: 4,
    title: "Marketing Support",
    subTitle:
      "Access to ready-to-use product photos, captions, and campaign kits.",
    icon: MessageSquare,
  },
];
