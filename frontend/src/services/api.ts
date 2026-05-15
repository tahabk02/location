import type { Car, Reservation, User } from "../types";

const isLocal = 
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1";

const API_URL = "/api";
console.log("Using API_URL:", API_URL, "on hostname:", window.location.hostname);

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
  const headers = {
    "Content-Type": "application/json",
    "x-user-role": user?.role || "",
    "x-user-id": user?.id || user?._id || "",
    "x-agency-id": user?.agencyId || "default",
  };
  console.log("API Headers:", headers);
  return headers;
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
  const response = await fetch(`${API_URL}/auth/all`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function deleteUser(id: string): Promise<any> {
  const response = await fetch(`${API_URL}/auth/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function updateUserPremium(id: string, data: { isBlacklisted?: boolean, loyaltyPoints?: number }): Promise<any> {
  const response = await fetch(`${API_URL}/auth/premium/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
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
  getAlerts: async () => {
    const response = await fetch(`${API_URL}/cars/alerts`, { headers: getHeaders() });
    return handleResponse(response);
  },
  updateStatus: async (id: string, status: string, available: boolean) => {
    const response = await fetch(`${API_URL}/cars/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status, available }),
    });
    return handleResponse(response);
  },
  create: createCar,
  update: updateCar,
  delete: deleteCar,
};

export const authService = {
  login,
  register,
  getUsers,
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },
  resetPassword: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const bookingService = {
  getAll: getAllBookings,
  getMy: getMyBookings,
  create: createBooking,
  updateStatus: updateBookingStatus,
  updateInspection: async (id: string, data: { type: 'check-in' | 'check-out', photos: string[], notes: string }) => {
    const response = await fetch(`${API_URL}/bookings/${id}/inspection`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
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
  get: async (agencyId?: string) => {
    const url = agencyId ? `${API_URL}/settings?agencyId=${agencyId}` : `${API_URL}/settings`;
    const response = await fetch(url, { headers: getHeaders() });
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

export const agencyService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/agencies/all`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getStats: async () => {
    const response = await fetch(`${API_URL}/agencies/stats`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/agencies`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

export const serviceService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/services`);
    return handleResponse(response);
  },
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/services`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: "DELETE",
      headers: getHeaders()
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

export const reviewService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/reviews`);
    return handleResponse(response);
  },
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export const notificationService = {
  getAdmin: async () => {
    const response = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
    return handleResponse(response);
  },
  markAsRead: async (id: string) => {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  markAllAsRead: async () => {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(response);
  }
};

export const analyticsService = {
  getSummary: async () => {
    const response = await fetch(`${API_URL}/analytics/summary`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getMonthly: async () => {
    const response = await fetch(`${API_URL}/analytics/monthly`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getCarPerformance: async () => {
    const response = await fetch(`${API_URL}/analytics/car-performance`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getExpenseBreakdown: async () => {
    const response = await fetch(`${API_URL}/analytics/expense-breakdown`, { headers: getHeaders() });
    return handleResponse(response);
  }
};

export const inventoryService = {
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await fetch(`${API_URL}/inventory`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (data: any): Promise<InventoryItem> => {
    const response = await fetch(`${API_URL}/inventory`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  update: async (id: string, data: any): Promise<any> => {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  delete: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

export const paymentService = {
  createIntent: async (amount: number, bookingId?: string) => {
    const response = await fetch(`${API_URL}/payments/create-intent`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, bookingId }),
    });
    return handleResponse(response);
  },
};
