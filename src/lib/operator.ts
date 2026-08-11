import { prisma } from "./db";

export type OperatorGarageStat = {
  id: string;
  slug: string;
  name: string;
  neighborhood: string;
  accent: string;
  listed: boolean;
  capacity: number;
  spotsAvailable: number;
  creditsPerHour: number;
  occupied: number;
  occupancyPct: number;
  activeSessions: number;
  upcoming: number;
  completed: number;
  revenue: number; // credits earned (active + completed)
};

export type OperatorRecentBooking = {
  id: string;
  garageName: string;
  garageAccent: string;
  driverName: string;
  startTime: Date;
  hours: number;
  creditsCost: number;
  status: string;
  vehiclePlate: string;
};

export type OperatorData = {
  garages: OperatorGarageStat[];
  totals: {
    garageCount: number;
    listedCount: number;
    totalCapacity: number;
    totalOccupied: number;
    occupancyPct: number;
    activeSessions: number;
    upcomingCount: number;
    revenue: number;
  };
  recentBookings: OperatorRecentBooking[];
};

const EARNING = new Set(["ACTIVE", "COMPLETED"]);

export async function getOperatorData(ownerId: string): Promise<OperatorData> {
  const garages = await prisma.garage.findMany({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
    include: {
      bookings: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  const garageStats: OperatorGarageStat[] = garages.map((g) => {
    const occupied = Math.max(0, g.capacity - g.spotsAvailable);
    const activeSessions = g.bookings.filter((b) => b.status === "ACTIVE").length;
    const upcoming = g.bookings.filter((b) => b.status === "CONFIRMED").length;
    const completed = g.bookings.filter((b) => b.status === "COMPLETED").length;
    const revenue = g.bookings
      .filter((b) => EARNING.has(b.status))
      .reduce((sum, b) => sum + b.creditsCost, 0);
    return {
      id: g.id,
      slug: g.slug,
      name: g.name,
      neighborhood: g.neighborhood,
      accent: g.accent,
      listed: g.listed,
      capacity: g.capacity,
      spotsAvailable: g.spotsAvailable,
      creditsPerHour: g.creditsPerHour,
      occupied,
      occupancyPct: g.capacity > 0 ? Math.round((occupied / g.capacity) * 100) : 0,
      activeSessions,
      upcoming,
      completed,
      revenue,
    };
  });

  const totalCapacity = garageStats.reduce((s, g) => s + g.capacity, 0);
  const totalOccupied = garageStats.reduce((s, g) => s + g.occupied, 0);

  const totals = {
    garageCount: garageStats.length,
    listedCount: garageStats.filter((g) => g.listed).length,
    totalCapacity,
    totalOccupied,
    occupancyPct: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
    activeSessions: garageStats.reduce((s, g) => s + g.activeSessions, 0),
    upcomingCount: garageStats.reduce((s, g) => s + g.upcoming, 0),
    revenue: garageStats.reduce((s, g) => s + g.revenue, 0),
  };

  const recentBookings: OperatorRecentBooking[] = garages
    .flatMap((g) =>
      g.bookings.map((b) => ({
        id: b.id,
        garageName: g.name,
        garageAccent: g.accent,
        driverName: b.user.name,
        startTime: b.startTime,
        hours: b.hours,
        creditsCost: b.creditsCost,
        status: b.status,
        vehiclePlate: b.vehiclePlate,
      }))
    )
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, 8);

  return { garages: garageStats, totals, recentBookings };
}
