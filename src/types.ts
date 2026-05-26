export interface Game {
  id: string;
  title: string;
  publisher?: string;
  stall?: string; // Stall / Stand location e.g. "Hall 1, Stand A24"
  description: string;
  category: string; // e.g., "STRATEGY", "EXPERT", "FAMILY", "SOCIAL", "EXCLUSIVE", etc.
  playerCount?: string; // e.g., "2-4", "1-4"
  playTime?: string; // e.g., "60m", "30-45m"
  imageUrl?: string;
  bggLink?: string; // BoardGameGeek Link
  statusText?: string; // e.g., "Demo Ready", "Available", "Low Stock", "Promo Available"
  visited?: boolean;
  mustPlay?: boolean;
  hall?: string; // "Hall 1", "Hall 2", "Retail", or "Unknown"
}

export type CategoryFilter = "All" | "Hall 1" | "Hall 2" | "Retail" | "Must Play";

export interface StallSearchResponse {
  gameTitle: string;
  publisher: string;
  stall: string;
  description: string;
  category: string;
  playerCount: string;
  playTime: string;
  statusText: string;
  hall: string;
  groundingSources?: Array<{ title: string; uri: string }>;
}
