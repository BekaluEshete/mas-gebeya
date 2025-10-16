// lib/api/analytics.js
import { authService } from "@/lib/auth";

const BASE_URL = "https://car-house-land.onrender.com/api/analytics";

export const analyticsAPI = {
  async getUserGrowth() {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/user-growth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user growth: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  },

  async getDealCompletion() {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/deal-completion`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deal completion: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  },

  async getDailyTraffic() {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/daily-traffic`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch daily traffic: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }
};