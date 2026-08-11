import { prisma } from "./db";

export type GarageDTO = {
  id: string;
  slug: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  creditsPerHour: number;
  capacity: number;
  spotsAvailable: number;
  rating: number;
  reviewCount: number;
  accent: string;
  description: string;
  amenities: string[];
  openHour: number;
  closeHour: number;
  listed: boolean;
  ownerId: string | null;
};

function toDTO(g: {
  id: string;
  slug: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  creditsPerHour: number;
  capacity: number;
  spotsAvailable: number;
  rating: number;
  reviewCount: number;
  accent: string;
  description: string;
  amenities: string;
  openHour: number;
  closeHour: number;
  listed: boolean;
  ownerId: string | null;
}): GarageDTO {
  return {
    ...g,
    amenities: g.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
  };
}

export async function getGarages(): Promise<GarageDTO[]> {
  const garages = await prisma.garage.findMany({
    where: { listed: true },
    orderBy: { rating: "desc" },
  });
  return garages.map(toDTO);
}

export async function getGarageBySlug(slug: string): Promise<GarageDTO | null> {
  const garage = await prisma.garage.findUnique({ where: { slug } });
  return garage && garage.listed ? toDTO(garage) : null;
}

export async function getFeaturedGarages(limit = 3): Promise<GarageDTO[]> {
  const garages = await prisma.garage.findMany({
    where: { listed: true },
    orderBy: { reviewCount: "desc" },
    take: limit,
  });
  return garages.map(toDTO);
}

export async function getGaragesByOwner(ownerId: string): Promise<GarageDTO[]> {
  const garages = await prisma.garage.findMany({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
  });
  return garages.map(toDTO);
}
