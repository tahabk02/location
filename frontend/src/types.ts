export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "client";
  agencyId?: string;
  isBlacklisted?: boolean;
  loyaltyPoints?: number;
  createdAt?: string;
}

export interface Car {
  _id?: string;
  agencyId?: string;
  brand: string;
  model: string;
  category: string;
  pricePerDay: number;
  seats: number;
  fuel: string;
  speed: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  available: boolean;
  status?: "available" | "rented" | "maintenance" | "cleaning" | "reserved";
  maintenanceDate?: string;
  insuranceExpiry?: string;
  technicalVisitExpiry?: string;
  vignetteExpiry?: string;
  lastOilChangeKm?: number;
  nextOilChangeKm?: number;
}

export interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category: "maintenance" | "fuel" | "insurance" | "tax" | "other";
  date: string;
  carId?: string;
}

export interface InventoryItem {
  _id?: string;
  name: string;
  quantity: number;
  minQuantity: number;
  category: string;
  price?: number;
  lastUpdated?: string;
}

export interface InspectionData {
  photos: string[];
  notes: string;
  date: string;
}

export interface Reservation {
  _id?: string;
  userId: string;
  carId: string;
  carInfo?: {
    brand: string;
    model: string;
    pricePerDay: number;
  };
  user?: User;
  startDate: string;
  endDate: string;
  location?: string;
  totalAmount?: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  invoiceNumber?: string;
  createdAt?: string;
  checkIn?: InspectionData;
  checkOut?: InspectionData;
}
