import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "turmeric",
    name: "Premium Turmeric",
    slug: "premium-turmeric",
    description: "Pure Alleppey Finger Turmeric with exceptionally high curcumin content, sun-dried to perfection.",
    priceInINR: 722.50, // Approx $8.50 USD per kg (at 1 USD = 85 INR)
    image: "/images/turmeric.webp",
    badge: "95% CURCUMIN",
    specs: "Alleppey Finger, Organic Certified"
  },
  {
    id: "black-pepper",
    name: "Black Pepper",
    slug: "black-pepper",
    description: "King of spices, bold MG1 grade black pepper from the Malabar coast, rich in piperine.",
    priceInINR: 573.75, // Approx $6.75 USD per kg
    image: "/images/black_pepper.webp",
    badge: "MG1 BOLD GRADE",
    specs: "Malabar Bold, High Piperine"
  },
  {
    id: "cardamom",
    name: "Green Cardamom",
    slug: "green-cardamom",
    description: "Handpicked extra bold green pods from Idukki, renowned for their intense aroma and fresh flavor.",
    priceInINR: 1870.00, // Approx $22.00 USD per kg
    image: "/images/cardamom.webp",
    badge: "8MM+ BOLD",
    specs: "Idukki Premium Green, Extra Bold"
  },
  {
    id: "cinnamon",
    name: "Ceylon Cinnamon",
    slug: "ceylon-cinnamon",
    description: "Authentic thin-quilled cinnamon with a sweet, delicate aroma and low coumarin content.",
    priceInINR: 1572.50, // Approx $18.50 USD per kg
    image: "/images/cinnamon.webp",
    badge: "ALBA GRADE",
    specs: "Thin Quill Ceylon, Organic"
  },
  {
    id: "ginger-powder",
    name: "Dry Ginger Powder",
    slug: "ginger-powder",
    description: "Zesty, sun-dried ginger ground into a fine powder. Perfect for tea, baking, and traditional recipes.",
    priceInINR: 450.00,
    image: "/images/ginger_powder.webp",
    badge: "ORGANIC DRY",
    specs: "Dry Ginger, Fine Ground"
  },
  {
    id: "clove-buds",
    name: "Premium Clove Buds",
    slug: "clove-buds",
    description: "Highly aromatic handpicked clove buds from Kerala. Rich in essential oils with a sweet, spicy pungency.",
    priceInINR: 950.00,
    image: "/images/cloves.webp",
    badge: "EXTRA BOLD",
    specs: "Handpicked Cloves, High Oil Content"
  },
  {
    id: "salt-packet",
    name: "Rock Salt Packet",
    slug: "salt-packet",
    description: "Premium, naturally mineral-rich rock salt packet. Perfect for testing and daily kitchen use.",
    priceInINR: 20.00,
    image: "/images/salt.webp",
    badge: "MINERAL RICH",
    specs: "Pure Rock Salt, 1 Packet",
    isFixedPrice: 1
  }
];

