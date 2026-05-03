export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "client";
}

export interface Car {
  _id?: string;
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
  status?: "available" | "rented" | "maintenance" | "cleaning";
  maintenanceDate?: string;
}

export interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category: "maintenance" | "fuel" | "insurance" | "tax" | "other";
  date: string;
  carId?: string;
}

export interface Reservation {
  _id?: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  location?: string;
  totalAmount?: number;
  status: "pending" | "confirmed" | "cancelled";
}
