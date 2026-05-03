import type { Car, Reservation, User } from "../types";

const API_URL = "/api";

async function handleResponse(response: Response) {
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    // Provide a detailed error message if available
    const errorMsg = json?.message || json?.error || `Status: ${response.status}`;
    throw new Error(errorMsg);
  }
  return json;
}

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return {
    "Content-Type": "application/json",
    "x-user-role": user?.role || "",
    "x-user-id": user?.id || user?._id || "", // Fix: support both 'id' and '_id'
  };
};

// Auth
export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function register(data: any): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Users
export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users/all`, { headers: getHeaders() });
  return handleResponse(response);
}

// Cars
export async function getCars(): Promise<Car[]> {
  const response = await fetch(`${API_URL}/cars`);
  return handleResponse(response);
}

export async function createCar(data: any): Promise<Car> {
  const response = await fetch(`${API_URL}/cars`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateCar(id: string, data: any): Promise<any> {
  const response = await fetch(`${API_URL}/cars/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteCar(id: string): Promise<any> {
  const response = await fetch(`${API_URL}/cars/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// Bookings
export async function createBooking(data: any): Promise<any> {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getMyBookings(): Promise<Reservation[]> {
  const response = await fetch(`${API_URL}/bookings/my-bookings`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getAllBookings(): Promise<Reservation[]> {
  const response = await fetch(`${API_URL}/bookings/all`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function updateBookingStatus(id: string, status: string): Promise<any> {
  const response = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export const carService = {
  getAll: getCars,
  create: createCar,
  update: updateCar,
  delete: deleteCar,
};

export const authService = {
  login,
  register,
  getUsers,
};

export const bookingService = {
  getAll: getAllBookings,
  getMy: getMyBookings,
  create: createBooking,
  updateStatus: updateBookingStatus,
};

export const expenseService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export const settingsService = {
  get: async () => {
    const response = await fetch(`${API_URL}/settings`);
    return handleResponse(response);
  },
  update: async (data: any) => {
    const response = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

export const promoService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/promos`);
    return handleResponse(response);
  },
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/promos`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/promos/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  toggle: async (id: string) => {
    const response = await fetch(`${API_URL}/promos/${id}/toggle`, {
      method: "PATCH",
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};
