import shoe1 from "@/assets/shoe-1.jpg";
import shoe2 from "@/assets/shoe-2.jpg";
import shoe3 from "@/assets/shoe-3.jpg";
import shoe4 from "@/assets/shoe-4.jpg";
import shoe5 from "@/assets/shoe-5.jpg";
import shoe6 from "@/assets/shoe-6.jpg";
import shoe7 from "@/assets/shoe-7.jpg";
import shoe8 from "@/assets/shoe-8.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: number[];
  colors: { name: string; hex: string }[];
  category: string;
  tags: string[];
  description: string;
};

const defaultSizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];

export const products: Product[] = [
  {
    id: "supernova-rise-2",
    name: "Supernova Rise 2",
    price: 33600,
    image: shoe1,
    sizes: defaultSizes,
    colors: [
      { name: "White / Blue", hex: "#e6ecf5" },
      { name: "Black", hex: "#111111" },
      { name: "Cream", hex: "#e9e4d8" },
    ],
    category: "Running",
    tags: ["men", "new"],
    description:
      "A daily trainer built for effortless miles. Energy return foam, breathable mesh upper, and a sculpted midsole for the long haul.",
  },
  {
    id: "adizero-adios-4",
    name: "Adizero Adios Pro 4",
    price: 67200,
    image: shoe2,
    sizes: defaultSizes,
    colors: [
      { name: "Chalk", hex: "#efece4" },
      { name: "Ink", hex: "#1a1a1a" },
    ],
    category: "Racing",
    tags: ["men", "sale"],
    description:
      "Race-day weapon. Carbon-infused plate, ultra-light cushioning, and a locked-in fit for personal bests.",
  },
  {
    id: "shift-fwd",
    name: "Shift FWD Runner",
    price: 40600,
    image: shoe3,
    sizes: defaultSizes,
    colors: [
      { name: "Slate / Lime", hex: "#5a6470" },
      { name: "Storm", hex: "#3a3f47" },
    ],
    category: "Running",
    tags: ["women", "new"],
    description:
      "Forward geometry. A responsive ride shaped for tempo runs and long weekend efforts.",
  },
  {
    id: "campus-84",
    name: "Campus 84",
    price: 26600,
    image: shoe4,
    sizes: defaultSizes,
    colors: [
      { name: "Navy / Gum", hex: "#1e2a44" },
      { name: "Black / Gum", hex: "#0e0e0e" },
    ],
    category: "Lifestyle",
    tags: ["men", "women"],
    description:
      "A heritage silhouette pulled from the archive. Suede overlays, gum sole, everyday wear.",
  },
  {
    id: "atlas-chunk",
    name: "Atlas Chunk",
    price: 44800,
    image: shoe5,
    sizes: defaultSizes,
    colors: [
      { name: "Sand", hex: "#c9b99a" },
      { name: "Stone", hex: "#a8a196" },
    ],
    category: "Lifestyle",
    tags: ["women"],
    description:
      "Oversized proportions, quiet color. A chunky silhouette that stays refined.",
  },
  {
    id: "court-og",
    name: "Court OG",
    price: 23800,
    image: shoe6,
    sizes: defaultSizes,
    colors: [
      { name: "Olive", hex: "#5c6a3a" },
      { name: "White", hex: "#f2f2f2" },
    ],
    category: "Lifestyle",
    tags: ["men", "sale"],
    description:
      "A clean court shoe. Low profile, leather upper, everyday-simple.",
  },
  {
    id: "phantom-black",
    name: "Phantom Black",
    price: 49000,
    image: shoe7,
    sizes: defaultSizes,
    colors: [
      { name: "Triple Black", hex: "#000000" },
      { name: "Graphite", hex: "#2a2a2a" },
    ],
    category: "Performance",
    tags: ["men"],
    description:
      "All-black tonal build. Engineered mesh, technical sole unit, no distractions.",
  },
  {
    id: "solar-orange",
    name: "Solar Orange",
    price: 37800,
    image: shoe8,
    sizes: defaultSizes,
    colors: [
      { name: "Solar", hex: "#ff5a1f" },
      { name: "Ember", hex: "#c94a1c" },
    ],
    category: "Running",
    tags: ["women", "sale"],
    description:
      "Loud color, quiet ride. A bold statement built on a proven cushioning platform.",
  },
  {
    id: "nike-air-max-97",
    name: "Nike Air Max 97 Off-White",
    price: 56000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    sizes: defaultSizes,
    colors: [
      { name: "Red / White", hex: "#d01c1f" },
    ],
    category: "Lifestyle",
    tags: ["men", "new"],
    description:
      "Iconic Air Max silhouette. Bold red finish, premium construction.",
  },
  {
    id: "adidas-gazelle-blue",
    name: "Adidas Gazelle",
    price: 32200,
    image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f",
    sizes: defaultSizes,
    colors: [
      { name: "Blue", hex: "#2a628f" },
    ],
    category: "Lifestyle",
    tags: ["men", "women"],
    description:
      "Classic suede Gazelle in striking blue. A timeless low-profile sneaker.",
  },
  {
    id: "new-balance-990",
    name: "New Balance 990v5",
    price: 52000,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570",
    sizes: defaultSizes,
    colors: [
      { name: "Grey", hex: "#8c8c8c" },
    ],
    category: "Lifestyle",
    tags: ["men", "women", "new"],
    description:
      "The quintessential dad shoe. Premium suede, unbeatable comfort, proudly chunky.",
  },
  {
    id: "nike-air-jordan-1",
    name: "Nike Air Jordan 1",
    price: 61600,
    image: "https://images.unsplash.com/photo-1552346154-21d32810baa3",
    sizes: defaultSizes,
    colors: [
      { name: "Black / White", hex: "#111111" },
    ],
    category: "Basketball",
    tags: ["men", "new", "sale"],
    description:
      "The one that started it all. High-top court classic with premium leather blocking.",
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
