import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const plans = [
  {
    key: "free",
    name: "Pay As You Go",
    monthlyCredits: 0,
    priceCents: 0,
    tagline: "No commitment. Buy credits only when you need to park.",
    highlight: false,
    sortOrder: 0,
    features: [
      "Access the full garage network",
      "Standard booking (no priority spots)",
      "Credits never included — top up anytime",
    ],
  },
  {
    key: "starter",
    name: "Starter",
    monthlyCredits: 100,
    priceCents: 2900,
    tagline: "For the occasional driver. About 12–15 hours of parking a month.",
    highlight: false,
    sortOrder: 1,
    features: [
      "100 credits every month",
      "Roll over up to 40 unused credits",
      "Free cancellation up to 1 hour before",
    ],
  },
  {
    key: "commuter",
    name: "Commuter",
    monthlyCredits: 300,
    priceCents: 6900,
    tagline: "Built for the daily commute. Park near work every weekday.",
    highlight: true,
    sortOrder: 2,
    features: [
      "300 credits every month",
      "Priority access at partner garages",
      "Roll over up to 120 unused credits",
      "Reserve up to 7 days ahead",
    ],
  },
  {
    key: "unlimited",
    name: "All-Access",
    monthlyCredits: 900,
    priceCents: 14900,
    tagline: "Park anywhere, anytime. The most flexibility we offer.",
    highlight: false,
    sortOrder: 3,
    features: [
      "900 credits every month",
      "Priority access everywhere",
      "Reserve up to 30 days ahead",
      "Guest passes for a second vehicle",
    ],
  },
];

const garages = [
  {
    slug: "embarcadero-center-garage",
    name: "Embarcadero Center Garage",
    address: "4 Embarcadero Center",
    neighborhood: "Financial District",
    lat: 37.7949,
    lng: -122.3994,
    creditsPerHour: 9,
    capacity: 420,
    spotsAvailable: 63,
    rating: 4.7,
    reviewCount: 1284,
    accent: "#17b478",
    description:
      "Covered parking in the heart of the Financial District, steps from the Ferry Building and BART. Perfect for weekday commuters.",
    amenities: "EV Charging,Covered,24/7 Access,Elevator,Security",
    openHour: 0,
    closeHour: 24,
  },
  {
    slug: "union-square-garage",
    name: "Union Square Garage",
    address: "333 Post St",
    neighborhood: "Union Square",
    lat: 37.7879,
    lng: -122.4074,
    creditsPerHour: 11,
    capacity: 985,
    spotsAvailable: 142,
    rating: 4.5,
    reviewCount: 2210,
    accent: "#0a9160",
    description:
      "The classic underground garage below Union Square. Ideal for shopping, theater, and dinner downtown.",
    amenities: "Covered,24/7 Access,Elevator,Security,Car Wash",
    openHour: 0,
    closeHour: 24,
  },
  {
    slug: "mission-bay-lot",
    name: "Mission Bay Lot 7",
    address: "1650 Owens St",
    neighborhood: "Mission Bay",
    lat: 37.7679,
    lng: -122.3925,
    creditsPerHour: 6,
    capacity: 310,
    spotsAvailable: 88,
    rating: 4.4,
    reviewCount: 512,
    accent: "#3fce8f",
    description:
      "Open-air lot near Chase Center and UCSF. Great value on non-event days and easy freeway access.",
    amenities: "EV Charging,Open Air,Event Parking,Security",
    openHour: 5,
    closeHour: 24,
  },
  {
    slug: "hayes-valley-garage",
    name: "Hayes Valley Garage",
    address: "300 Grove St",
    neighborhood: "Hayes Valley",
    lat: 37.7776,
    lng: -122.4213,
    creditsPerHour: 8,
    capacity: 180,
    spotsAvailable: 24,
    rating: 4.6,
    reviewCount: 733,
    accent: "#0a7450",
    description:
      "Compact, well-lit garage minutes from the Opera House and Symphony. Boutique shopping right outside.",
    amenities: "Covered,EV Charging,Elevator,Security",
    openHour: 6,
    closeHour: 24,
  },
  {
    slug: "north-beach-garage",
    name: "North Beach Garage",
    address: "735 Vallejo St",
    neighborhood: "North Beach",
    lat: 37.7987,
    lng: -122.4098,
    creditsPerHour: 7,
    capacity: 200,
    spotsAvailable: 41,
    rating: 4.3,
    reviewCount: 456,
    accent: "#17b478",
    description:
      "Neighborhood garage surrounded by cafes and restaurants. A short walk to Washington Square and the waterfront.",
    amenities: "Covered,24/7 Access,Security",
    openHour: 0,
    closeHour: 24,
  },
  {
    slug: "soma-tech-garage",
    name: "SoMa Tech Center Garage",
    address: "680 Folsom St",
    neighborhood: "SoMa",
    lat: 37.7857,
    lng: -122.3971,
    creditsPerHour: 10,
    capacity: 540,
    spotsAvailable: 97,
    rating: 4.6,
    reviewCount: 1502,
    accent: "#0a9160",
    description:
      "Modern garage below a SoMa office tower with fast EV charging and a bike valet. Popular with weekday commuters.",
    amenities: "EV Charging,Covered,Bike Valet,Elevator,Security,24/7 Access",
    openHour: 0,
    closeHour: 24,
  },
  {
    slug: "marina-boulevard-lot",
    name: "Marina Boulevard Lot",
    address: "3950 Scott St",
    neighborhood: "Marina",
    lat: 37.8058,
    lng: -122.4368,
    creditsPerHour: 6,
    capacity: 150,
    spotsAvailable: 33,
    rating: 4.2,
    reviewCount: 289,
    accent: "#3fce8f",
    description:
      "Open lot a block from the Marina Green with bay views. Easy access to the Presidio and Crissy Field.",
    amenities: "Open Air,Security",
    openHour: 6,
    closeHour: 23,
  },
  {
    slug: "civic-center-plaza-garage",
    name: "Civic Center Plaza Garage",
    address: "355 McAllister St",
    neighborhood: "Civic Center",
    lat: 37.7801,
    lng: -122.4157,
    creditsPerHour: 8,
    capacity: 720,
    spotsAvailable: 205,
    rating: 4.4,
    reviewCount: 980,
    accent: "#0a7450",
    description:
      "Large underground garage beneath Civic Center Plaza. Central for City Hall, the library, and BART.",
    amenities: "Covered,24/7 Access,Elevator,Security,EV Charging",
    openHour: 0,
    closeHour: 24,
  },
  {
    slug: "castro-theatre-garage",
    name: "Castro District Garage",
    address: "500 Castro St",
    neighborhood: "Castro",
    lat: 37.7616,
    lng: -122.435,
    creditsPerHour: 7,
    capacity: 160,
    spotsAvailable: 18,
    rating: 4.5,
    reviewCount: 402,
    accent: "#17b478",
    description:
      "Handy garage in the middle of the Castro, close to Dolores Park and the theater district.",
    amenities: "Covered,Elevator,Security",
    openHour: 7,
    closeHour: 24,
  },
  {
    slug: "presidio-gateway-garage",
    name: "Presidio Gateway Garage",
    address: "104 Montgomery St",
    neighborhood: "Presidio",
    lat: 37.7989,
    lng: -122.4574,
    creditsPerHour: 5,
    capacity: 240,
    spotsAvailable: 120,
    rating: 4.8,
    reviewCount: 621,
    accent: "#0a9160",
    description:
      "Quiet, tree-lined garage at the edge of the Presidio. The best value in the network for all-day parking.",
    amenities: "Open Air,EV Charging,Security,Trailhead Access",
    openHour: 6,
    closeHour: 22,
  },
  {
    slug: "japantown-center-garage",
    name: "Japantown Center Garage",
    address: "1660 Geary Blvd",
    neighborhood: "Japantown",
    lat: 37.7849,
    lng: -122.4294,
    creditsPerHour: 6,
    capacity: 480,
    spotsAvailable: 156,
    rating: 4.3,
    reviewCount: 545,
    accent: "#3fce8f",
    description:
      "Spacious garage under the Japan Center malls. Ramen, karaoke, and shopping without the street-parking hunt.",
    amenities: "Covered,Elevator,Security,24/7 Access",
    openHour: 0,
    closeHour: 24,
  },
  {
    slug: "dogpatch-pier-lot",
    name: "Dogpatch Pier Lot",
    address: "700 Illinois St",
    neighborhood: "Dogpatch",
    lat: 37.7597,
    lng: -122.3872,
    creditsPerHour: 5,
    capacity: 130,
    spotsAvailable: 47,
    rating: 4.1,
    reviewCount: 178,
    accent: "#0a7450",
    description:
      "Waterfront open lot near the breweries and galleries of Dogpatch. Relaxed, affordable, and rarely full.",
    amenities: "Open Air,EV Charging,Security",
    openHour: 6,
    closeHour: 23,
  },
];

async function main() {
  console.log("Seeding SpotPass…");

  // Plans
  for (const plan of plans) {
    const { features, ...rest } = plan;
    await prisma.plan.upsert({
      where: { key: plan.key },
      update: { ...rest, features: JSON.stringify(features) },
      create: { ...rest, features: JSON.stringify(features) },
    });
  }
  console.log(`  ✓ ${plans.length} membership plans`);

  // Garages
  for (const garage of garages) {
    await prisma.garage.upsert({
      where: { slug: garage.slug },
      update: garage,
      create: garage,
    });
  }
  console.log(`  ✓ ${garages.length} garages`);

  // Demo user
  const demoEmail = "demo@spotpass.app";
  const passwordHash = await bcrypt.hash("password123", 10);
  const demo = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo Driver",
      passwordHash,
      credits: 300,
      planKey: "commuter",
      homeCity: "San Francisco",
    },
  });

  // Give the demo user a starting transaction + one sample upcoming booking.
  const existingTx = await prisma.creditTransaction.count({
    where: { userId: demo.id },
  });
  if (existingTx === 0) {
    await prisma.creditTransaction.create({
      data: {
        userId: demo.id,
        amount: 300,
        type: "ALLOWANCE",
        description: "Commuter plan — August credits",
      },
    });
  }

  console.log(`  ✓ demo user (${demoEmail} / password123)`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
