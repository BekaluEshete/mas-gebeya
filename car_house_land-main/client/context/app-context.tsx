"use client";

import { useEffect, Suspense } from "react";
import type React from "react";
import { createContext, useContext, useReducer, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type {
  Car,
  House,
  Land,
  Machine,
  Deal,
  Consultation,
  Activity,
} from "@/types";
import {
  fetchCars,
  deleteCar as apiDeleteCar,
} from "@/lib/api/cars";
import {
  fetchProperties,
  deleteHouse as apiDeleteHouse,
} from "@/lib/api/properties";
import { fetchLands, deleteLand as apiDeleteLand } from "@/lib/api/lands";
import { fetchMachines, deleteMachine as apiDeleteMachine } from "@/lib/api/machines";
import { MACHINES_DATA } from "@/lib/data/machines";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/lib/auth";
import {
  fetchDeals,
  createDeal as apiCreateDeal,
  updateDealStatus as apiUpdateDealStatus,
} from "@/lib/api/deals";
import { mapApiDealToLocal } from "@/lib/utils/mappers";
import { authService } from "@/lib/auth";

interface AppState {
  cart: Array<{
    id: string;
    type: "car" | "house" | "land" | "machine";
    item: Car | House | Land | Machine;
    quantity: number;
  }>;
  favorites: Array<{
    id: string;
    type: "car" | "house" | "land" | "machine";
    item: Car | House | Land | Machine;
  }>;
  deals: Deal[];
  consultations: Consultation[];
  activities: Activity[];
  soldItems: Set<string>;
  isAuthModalOpen: boolean;
  cars: Car[];
  houses: House[];
  machines: Machine[];
  lands: Land[];
  carsLoading: boolean;
  housesLoading: boolean;
  landsLoading: boolean;
  machinesLoading: boolean;
  activitiesLoading: boolean;
}

type AppAction =
  | { type: "ADD_TO_CART"; payload: { type: "car" | "house" | "land" | "machine"; item: Car | House | Land | Machine } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: string; quantity: number } }
  | {
      type: "ADD_TO_FAVORITES";
      payload: { type: "car" | "house" | "land" | "machine"; item: Car | House | Land | Machine };
    }
  | { type: "REMOVE_FROM_FAVORITES"; payload: string }
  | { type: "SET_AUTH_MODAL"; payload: boolean }
  | { type: "SET_DEALS"; payload: Deal[] }
  | { type: "ADD_DEAL"; payload: Deal }
  | { type: "UPDATE_DEAL"; payload: { id: string; updates: Partial<Deal> } }
  | { type: "SET_CONSULTATIONS"; payload: Consultation[] }
  | { type: "SET_ACTIVITIES"; payload: Activity[] }
  | { type: "ADD_ACTIVITY"; payload: Activity }
  | { type: "ADD_CONSULTATION"; payload: Consultation }
  | { type: "UPDATE_CONSULTATION"; payload: { id: string; updates: Partial<Consultation> } }
  | {
      type: "SET_CART";
      payload: Array<{
        id: string;
        type: "car" | "house" | "land" | "machine";
        item: Car | House | Land | Machine;
        quantity: number;
      }>;
    }
  | {
      type: "SET_FAVORITES";
      payload: Array<{
        id: string;
        type: "car" | "house" | "land" | "machine";
        item: Car | House | Land | Machine;
      }>;
    }
  | { type: "SET_CARS"; payload: Car[] }
  | { type: "ADD_CAR"; payload: Car }
  | { type: "UPDATE_CAR"; payload: { id: string; updates: Partial<Car> } }
  | { type: "DELETE_CAR"; payload: string }
  | { type: "SET_HOUSES"; payload: House[] }
  | { type: "ADD_HOUSE"; payload: House }
  | { type: "UPDATE_HOUSE"; payload: { id: string; updates: Partial<House> } }
  | { type: "DELETE_HOUSE"; payload: string }
  | { type: "SET_MACHINES"; payload: Machine[] }
  | { type: "ADD_MACHINE"; payload: Machine }
  | { type: "UPDATE_MACHINE"; payload: { id: string; updates: Partial<Machine> } }
  | { type: "DELETE_MACHINE"; payload: string }
  | { type: "SET_LANDS"; payload: Land[] }
  | { type: "ADD_LAND"; payload: Land }
  | { type: "UPDATE_LAND"; payload: { id: string; updates: Partial<Land> } }
  | { type: "DELETE_LAND"; payload: string }
  | { type: "SET_CARS_LOADING"; payload: boolean }
  | { type: "SET_HOUSES_LOADING"; payload: boolean }
  | { type: "SET_LANDS_LOADING"; payload: boolean }
  | { type: "SET_MACHINES_LOADING"; payload: boolean }
  | { type: "SET_ACTIVITIES_LOADING"; payload: boolean };

interface AppContextType extends AppState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  dispatch: React.Dispatch<AppAction>;
  addToCart: (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  addToFavorites: (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => void;
  removeFromFavorites: (id: string) => void;
  toggleFavorite: (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => void;
  isFavorite: (itemId: string) => boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  createDeal: (
    itemType: "car" | "house" | "land" | "machine",
    item: Car | House | Land | Machine,
    message: string,
  ) => Promise<void>;
  updateDealStatus: (dealId: string, status: Deal["status"], cancellationReason?: string) => Promise<void>;
  getPendingDealsCount: () => number;
  getUserDeals: () => Deal[];
  getAdminDeals: () => Deal[];
  addCar: (car: Car) => void;
  updateCar: (id: string, updates: Partial<Car>) => void;
  deleteCar: (id: string) => Promise<void>;
  addHouse: (house: House) => void;
  updateHouse: (id: string, updates: Partial<House>) => void;
  deleteHouse: (id: string) => Promise<void>;
  addMachine: (machine: Machine) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  deleteMachine: (id: string) => Promise<void>;
  addLand: (land: Land) => void;
  updateLand: (id: string, updates: Partial<Land>) => void;
  deleteLand: (id: string) => Promise<void>;
  refreshCars: () => Promise<void>;
  refreshHouses: () => Promise<void>;
  refreshLands: () => Promise<void>;
  refreshMachines: () => Promise<void>;
  refreshDeals: () => Promise<void>;
  createConsultation: (data: Omit<Consultation, "id" | "status" | "createdAt" | "updatedAt">) => Promise<Consultation>;
  updateConsultationStatus: (id: string, status: Consultation["status"], notes?: string) => Promise<void>;
  fetchConsultations: () => Promise<void>;
  refreshConsultations: () => Promise<void>;
  getPendingConsultationsCount: () => number;
  fetchRecentActivities: (limit?: number) => Promise<void>;
  logActivity: (action: string, entityType: string, description: string, entityId?: string) => Promise<void>;
  getRecentActivities: () => Activity[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cart: action.payload || [] };
    case "ADD_TO_CART":
      const existingCartItem = state.cart.find(
        (item) => item.type === action.payload.type && item.item.id === action.payload.item.id,
      );
      if (existingCartItem) {
        return state;
      }
      const newCartItem = {
        id: `${action.payload.type}-${action.payload.item.id}-${Date.now()}`,
        type: action.payload.type,
        item: action.payload.item,
        quantity: 1,
      };
      return { ...state, cart: [...(state.cart || []), newCartItem] };
    case "REMOVE_FROM_CART":
      return { ...state, cart: (state.cart || []).filter((item) => item.id !== action.payload) };
    case "UPDATE_CART_QUANTITY":
      return state; // Implement if needed
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload || [] };
    case "ADD_TO_FAVORITES":
      const existingFavorite = state.favorites.find(
        (item) => item.type === action.payload.type && item.item.id === action.payload.item.id,
      );
      if (existingFavorite) return state;
      const newFavorite = {
        id: `${action.payload.type}-${action.payload.item.id}`,
        type: action.payload.type,
        item: action.payload.item,
      };
      return { ...state, favorites: [...(state.favorites || []), newFavorite] };
    case "REMOVE_FROM_FAVORITES":
      return { ...state, favorites: (state.favorites || []).filter((item) => item.id !== action.payload) };
    case "SET_AUTH_MODAL":
      return { ...state, isAuthModalOpen: action.payload };
    case "SET_DEALS":
      return { ...state, deals: action.payload || [] };
    case "ADD_DEAL":
      return { ...state, deals: [...(state.deals || []), action.payload] };
    case "UPDATE_DEAL":
      return {
        ...state,
        deals: (state.deals || []).map((deal) =>
          deal.id === action.payload.id ? { ...deal, ...action.payload.updates } : deal,
        ),
      };
    case "SET_CONSULTATIONS":
      return { ...state, consultations: action.payload || [] };
    case "ADD_CONSULTATION":
      return { ...state, consultations: [...(state.consultations || []), action.payload] };
    case "UPDATE_CONSULTATION":
      return {
        ...state,
        consultations: (state.consultations || []).map((consult) =>
          consult.id === action.payload.id ? { ...consult, ...action.payload.updates } : consult,
        ),
      };
    case "SET_CARS":
      return { ...state, cars: action.payload };
    case "ADD_CAR":
      return { ...state, cars: [...state.cars, action.payload] };
    case "UPDATE_CAR":
      return {
        ...state,
        cars: state.cars.map((car) => (car.id === action.payload.id ? { ...car, ...action.payload.updates } : car)),
      };
    case "DELETE_CAR":
      return { ...state, cars: state.cars.filter((car) => car.id !== action.payload) };
    case "SET_HOUSES":
      return { ...state, houses: action.payload };
    case "ADD_HOUSE":
      return { ...state, houses: [...state.houses, action.payload] };
    case "UPDATE_HOUSE":
      return {
        ...state,
        houses: state.houses.map((house) =>
          house.id === action.payload.id ? { ...house, ...action.payload.updates } : house,
        ),
      };
    case "DELETE_HOUSE":
      return { ...state, houses: state.houses.filter((house) => house.id !== action.payload) };
    case "SET_MACHINES":
      return { ...state, machines: action.payload };
    case "ADD_MACHINE":
      return { ...state, machines: [...state.machines, action.payload] };
    case "UPDATE_MACHINE":
      return {
        ...state,
        machines: state.machines.map((machine) =>
          machine.id === action.payload.id ? { ...machine, ...action.payload.updates } : machine,
        ),
      };
    case "DELETE_MACHINE":
      return { ...state, machines: state.machines.filter((machine) => machine.id !== action.payload) };
    case "SET_LANDS":
      return { ...state, lands: action.payload };
    case "ADD_LAND":
      return { ...state, lands: [...state.lands, action.payload] };
    case "UPDATE_LAND":
      return {
        ...state,
        lands: state.lands.map((land) =>
          land.id === action.payload.id ? { ...land, ...action.payload.updates } : land,
        ),
      };
    case "DELETE_LAND":
      return { ...state, lands: state.lands.filter((land) => land.id !== action.payload) };
    case "SET_CARS_LOADING":
      return { ...state, carsLoading: action.payload };
    case "SET_HOUSES_LOADING":
      return { ...state, housesLoading: action.payload };
    case "SET_LANDS_LOADING":
      return { ...state, landsLoading: action.payload };
    case "SET_MACHINES_LOADING":
      return { ...state, machinesLoading: action.payload };
    case "SET_ACTIVITIES":
      return { ...state, activities: action.payload };
    case "ADD_ACTIVITY":
      return { ...state, activities: [action.payload, ...state.activities.slice(0, 9)] };
    case "SET_ACTIVITIES_LOADING":
      return { ...state, activitiesLoading: action.payload };
    default:
      return state;
  }
}

function SearchParamsHandler({ onAuthRequired }: { onAuthRequired: (required: boolean) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authRequired = searchParams.get("auth") === "required";
    onAuthRequired(authRequired);
  }, [searchParams, onAuthRequired]);

  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const [state, dispatch] = useReducer(appReducer, {
    cart: [],
    favorites: [],
    deals: [],
    consultations: [],
    activities: [],
    soldItems: new Set(),
    isAuthModalOpen: false,
    cars: [],
    houses: [],
    machines: [],
    lands: [],
    carsLoading: false,
    housesLoading: false,
    landsLoading: false,
    machinesLoading: false,
    activitiesLoading: false,
  });

  const handleAuthRequired = (required: boolean) => {
    if (required && !auth.isAuthenticated && !auth.loading) {
      console.log("[v0] Middleware requires authentication, opening auth modal");
      dispatch({ type: "SET_AUTH_MODAL", payload: true });
    }
  };

  const loadCarsFromAPI = async () => {
    dispatch({ type: "SET_CARS_LOADING", payload: true });
    try {
      const apiCars = await fetchCars();
      dispatch({ type: "SET_CARS", payload: apiCars });
    } catch (error) {
      console.error("Error loading cars from API:", error);
    } finally {
      dispatch({ type: "SET_CARS_LOADING", payload: false });
    }
  };

  const loadHousesFromAPI = async () => {
    dispatch({ type: "SET_HOUSES_LOADING", payload: true });
    try {
      const apiHouses = await fetchProperties();
      dispatch({ type: "SET_HOUSES", payload: apiHouses });
    } catch (error) {
      console.error("Error loading houses from API:", error);
    } finally {
      dispatch({ type: "SET_HOUSES_LOADING", payload: false });
    }
  };

  const loadLandsFromAPI = async () => {
    dispatch({ type: "SET_LANDS_LOADING", payload: true });
    try {
      const apiLands = await fetchLands();
      dispatch({ type: "SET_LANDS", payload: apiLands });
    } catch (error) {
      console.error("Error loading lands from API:", error);
    } finally {
      dispatch({ type: "SET_LANDS_LOADING", payload: false });
    }
  };

  const loadMachinesFromAPI = async () => {
    dispatch({ type: "SET_MACHINES_LOADING", payload: true });
    try {
      const apiMachines = await fetchMachines();
      dispatch({ type: "SET_MACHINES", payload: apiMachines });
    } catch (error) {
      console.error("Error loading machines from API:", error);
    } finally {
      dispatch({ type: "SET_MACHINES_LOADING", payload: false });
    }
  };

  const refreshCars = async () => {
    await loadCarsFromAPI();
  };

  const refreshHouses = async () => {
    await loadHousesFromAPI();
  };

  const refreshLands = async () => {
    await loadLandsFromAPI();
  };

  const refreshMachines = async () => {
    await loadMachinesFromAPI();
  };

  const addToCart = (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => {
    dispatch({ type: "ADD_TO_CART", payload: { type, item } });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_CART_QUANTITY", payload: { id, quantity } });
  };

  const addToFavorites = (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => {
    dispatch({ type: "ADD_TO_FAVORITES", payload: { type, item } });
  };

  const removeFromFavorites = (id: string) => {
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: id });
  };

  const toggleFavorite = (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => {
    const favoriteId = `${type}-${item.id}`;
    const isFav = state.favorites.some((fav) => fav.id === favoriteId);
    if (isFav) {
      removeFromFavorites(favoriteId);
    } else {
      addToFavorites(type, item);
    }
  };

  const isFavorite = (itemId: string) => {
    return state.favorites.some((fav) => fav.item.id === itemId);
  };

  const setIsAuthModalOpen = (open: boolean) => {
    dispatch({ type: "SET_AUTH_MODAL", payload: open });

    if (!open && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("auth") === "required") {
        url.searchParams.delete("auth");
        window.history.replaceState({}, "", url.toString());
      }
    }
  };

  const loadDealsFromAPI = async () => {
    if (!auth.user) return;

    try {
      const apiDeals = await fetchDeals();
      const mappedDeals = apiDeals.map(mapApiDealToLocal);
      dispatch({ type: "SET_DEALS", payload: mappedDeals });
    } catch (error) {
      console.error("Error loading deals from API:", error);
    }
  };

  const createDeal = async (
    itemType: "car" | "house" | "land" | "machine",
    item: Car | House | Land | Machine,
    message: string,
  ) => {
    if (!auth.user) {
      console.log("[v0] User not authenticated, cannot create deal");
      return;
    }

    try {
      const backendItemType =
        itemType === "house"
          ? "Property"
          : ((itemType.charAt(0).toUpperCase() + itemType.slice(1)) as "Car" | "Property" | "Land" | "Machine");

      const sellerId = item.sellerId || item.owner || auth.user._id;
      const sellerName = item.sellerName || item.ownerName || "Property Owner";

      const dealData = {
        item: item.id,
        itemType: backendItemType,
        buyer: auth.user._id,
        seller: sellerId,
        message,
        dealType: "inquiry",
      };

      const newDeal = await apiCreateDeal(dealData);
      if (newDeal) {
        const mappedDeal: Deal = {
          _id: newDeal._id || `deal-${Date.now()}`,
          id: newDeal._id || `deal-${Date.now()}`,
          dealId: newDeal.dealId || `DEAL-${Date.now()}`,
          buyer: {
            _id: auth.user._id,
            fullName: auth.user.fullName,
            email: auth.user.email,
            phone: auth.user.phone,
          },
          seller: {
            _id: sellerId,
            fullName: sellerName,
            email: item.sellerEmail || "seller@example.com",
            phone: item.sellerPhone || "+251-911-123-456",
          },
          item: {
            _id: item.id,
            title: item.title,
            price: item.price,
            images: item.images || [],
            description: item.description || "",
            location:
              item.location ||
              `${item.city || ""}, ${item.region || ""}`.trim().replace(/^,\s*/, "") ||
              "Location not specified",
            ...(itemType === "car" && {
              make: (item as Car).make,
              model: (item as Car).model,
              year: (item as Car).year,
              mileage: (item as Car).mileage,
              fuelType: (item as Car).fuelType,
              transmission: (item as Car).transmission,
              color: (item as Car).color,
              condition: (item as Car).condition,
            }),
            ...(itemType === "house" && {
              bedrooms: (item as House).bedrooms,
              bathrooms: (item as House).bathrooms,
              area: (item as House).area,
              propertyType: (item as House).propertyType,
              listingType: (item as House).listingType,
            }),
            ...(itemType === "land" && {
              area: (item as Land).area,
              landType: (item as Land).landType,
              zoning: (item as Land).zoning,
            }),
            ...(itemType === "machine" && {
              category: (item as Machine).category,
              condition: (item as Machine).condition,
              year: (item as Machine).year,
            }),
          },
          itemType: backendItemType,
          message,
          originalPrice: item.price,
          status: newDeal.status || "pending",
          createdAt: newDeal.createdAt || new Date().toISOString(),
          updatedAt: newDeal.updatedAt || new Date().toISOString(),
          itemId: item.id,
          userId: auth.user._id,
          userName: auth.user.fullName,
          userEmail: auth.user.email,
          userPhone: auth.user.phone,
          chatHistory: [],
          adminInfo: {
            name: "Alemayehu Bekele",
            email: "admin@ethiopiapropertyauto.com",
            phone: "+251 911 123 456",
            telegram: "@ethiopiapropertyauto_admin",
            whatsapp: "+251-911-123-456",
          },
        };

        dispatch({ type: "ADD_DEAL", payload: mappedDeal });
        await logActivity("created", "deal", `created a deal for ${item.title}`, newDeal._id);
      }
    } catch (error) {
      console.error("[v0] API call failed:", error);
      throw new Error("Failed to create deal. Please try again.");
    }
  };

  const updateDealStatus = async (dealId: string, status: Deal["status"], cancellationReason?: string) => {
    try {
      const statusData = { status, cancellationReason };
      const updatedDeal = await apiUpdateDealStatus(dealId, statusData);
      if (updatedDeal) {
        const mappedDeal = mapApiDealToLocal(updatedDeal);
        dispatch({ type: "UPDATE_DEAL", payload: { id: dealId, updates: mappedDeal } });
        await logActivity(status, "deal", `updated deal status to ${status}`, dealId);
      }
    } catch (error) {
      console.error("Error updating deal status:", error);
      throw new Error("Failed to update deal status. Please try again.");
    }
  };

  const refreshDeals = async () => {
    await loadDealsFromAPI();
  };

  const addCar = (car: Car) => {
    dispatch({ type: "ADD_CAR", payload: car });
    logActivity("created", "car", `added car: ${car.title}`, car.id);
  };

  const updateCar = (id: string, updates: Partial<Car>) => {
    dispatch({ type: "UPDATE_CAR", payload: { id, updates } });
    logActivity("updated", "car", `updated car: ${updates.title}`, id);
  };

  const deleteCar = async (id: string) => {
    if (auth.user?.token) {
      try {
        const success = await apiDeleteCar(id, auth.user.token);
        if (success) {
          dispatch({ type: "DELETE_CAR", payload: id });
          logActivity("deleted", "car", `deleted car`, id);
        }
      } catch (error) {
        console.error("Error deleting car:", error);
        throw new Error("Failed to delete car. Please try again.");
      }
    }
  };

  const addHouse = (house: House) => {
    dispatch({ type: "ADD_HOUSE", payload: house });
    logActivity("created", "house", `added house: ${house.title}`, house.id);
  };

  const updateHouse = (id: string, updates: Partial<House>) => {
    dispatch({ type: "UPDATE_HOUSE", payload: { id, updates } });
    logActivity("updated", "house", `updated house: ${updates.title}`, id);
  };

  const deleteHouse = async (id: string) => {
    if (auth.user?.token) {
      try {
        const success = await apiDeleteHouse(id, auth.user.token);
        if (success) {
          dispatch({ type: "DELETE_HOUSE", payload: id });
          logActivity("deleted", "house", `deleted house`, id);
        }
      } catch (error) {
        console.error("Error deleting house:", error);
        throw new Error("Failed to delete house. Please try again.");
      }
    }
  };

  const addMachine = (machine: Machine) => {
    dispatch({ type: "ADD_MACHINE", payload: machine });
    logActivity("created", "machine", `added machine: ${machine.title}`, machine.id);
  };

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    dispatch({ type: "UPDATE_MACHINE", payload: { id, updates } });
    logActivity("updated", "machine", `updated machine: ${updates.title}`, id);
  };

  const deleteMachine = async (id: string) => {
    if (auth.user?.token) {
      try {
        const success = await apiDeleteMachine(id, auth.user.token);
        if (success) {
          dispatch({ type: "DELETE_MACHINE", payload: id });
          logActivity("deleted", "machine", `deleted machine`, id);
        }
      } catch (error) {
        console.error("Error deleting machine:", error);
        throw new Error("Failed to delete machine. Please try again.");
      }
    }
  };

  const addLand = (land: Land) => {
    dispatch({ type: "ADD_LAND", payload: land });
    logActivity("created", "land", `added land: ${land.title}`, land.id);
  };

  const updateLand = (id: string, updates: Partial<Land>) => {
    dispatch({ type: "UPDATE_LAND", payload: { id, updates } });
    logActivity("updated", "land", `updated land: ${updates.title}`, id);
  };

  const deleteLand = async (id: string) => {
    if (auth.user?.token) {
      try {
        const success = await apiDeleteLand(id, auth.user.token);
        if (success) {
          dispatch({ type: "DELETE_LAND", payload: id });
          logActivity("deleted", "land", `deleted land`, id);
        }
      } catch (error) {
        console.error("Error deleting land:", error);
        throw new Error("Failed to delete land. Please try again.");
      }
    }
  };

const fetchConsultations = async () => {
  const token = authService.getStoredToken();
  console.log("fetchConsultations token:", token ? "Present" : "Missing");

  if (!token) {
    console.error("No token for fetchConsultations");
    throw new Error("Authentication required to fetch consultations");
  }

  try {
    const response = await fetch("https://car-house-land.onrender.com/api/consultations", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("fetchConsultations response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        console.log("Fetched consultations:", data.data); // Add this line
        dispatch({ type: "SET_CONSULTATIONS", payload: data.data });
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } else {
      throw new Error(`Failed to fetch consultations: ${response.status} - ${await response.text()}`);
    }
  } catch (error) {
    console.error("Error loading consultations from API:", error);
    throw error;
  }
};

  const createConsultation = async (data: Omit<Consultation, "id" | "status" | "createdAt" | "updatedAt">): Promise<Consultation> => {
    const token = authService.getStoredToken();
    console.log("createConsultation token:", token ? "Present" : "Missing");
    console.log("Sending payload:", JSON.stringify(data, null, 2));

    if (!token) {
      console.error("No token in createConsultation");
      throw new Error("No authentication token found - please log in again");
    }

    try {
      const response = await fetch("https://car-house-land.onrender.com/api/consultations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("createConsultation response status:", response.status);

      if (response.ok) {
        const newConsult = await response.json();
        console.log("Raw response:", newConsult);
        if (newConsult.status === "success" && newConsult.data) {
          dispatch({ type: "ADD_CONSULTATION", payload: newConsult.data });
          await logActivity(
            "created",
            "consultation",
            `booked a ${data.type} consultation`,
            newConsult.data._id,
          );
          return newConsult.data;
        } else {
          throw new Error(newConsult.message || "Invalid response from server");
        }
      } else {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error creating consultation:", error);
      throw new Error("Failed to create consultation. Please try again or contact support.");
    }
  };

 const updateConsultationStatus = async (id: string, status: Consultation["status"], notes?: string): Promise<void> => {
  const token = authService.getStoredToken();
  console.log("updateConsultationStatus token:", token ? "Present" : "Missing");

  if (!token) {
    console.error("No token in updateConsultationStatus");
    throw new Error("No authentication token found");
  }

  if (!id) {
    console.error("Invalid consultation ID:", id);
    throw new Error("Invalid consultation ID");
  }

  try {
    const response = await fetch(`https://car-house-land.onrender.com/api/consultations/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, agentNotes: notes }),
    });

    console.log("updateConsultationStatus response status:", response.status);

    if (response.ok) {
      const updated = await response.json();
      if (updated.status === "success" && updated.data) {
        dispatch({ type: "UPDATE_CONSULTATION", payload: { id, updates: updated.data } });
        await logActivity(status, "consultation", `updated consultation status to ${status}`, id);
      }
    } else {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(`Failed to update consultation: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("Error updating consultation status:", error);
    throw error instanceof Error ? error : new Error("Failed to update consultation status. Please try again.");
  }
};
  const refreshConsultations = async () => {
    await fetchConsultations();
  };

  const fetchRecentActivities = async (limit = 10) => {
    dispatch({ type: "SET_ACTIVITIES_LOADING", payload: true });

    try {
      const token = authService.getStoredToken();

      if (!token) {
        console.log("🔄 No token available, generating activities from existing data");
        generateActivitiesFromExistingData();
        return;
      }

      console.log("🔄 Fetching activities from API...");
      const response = await fetch(
        `https://car-house-land.onrender.com/api/activities/recent?limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("📨 Activities API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.activities)) {
          console.log(`✅ Successfully loaded ${data.activities.length} activities from API`);
          dispatch({ type: "SET_ACTIVITIES", payload: data.activities });
          return;
        }
      }

      console.log("⚠️ Activities endpoint not available, generating from existing data");
      generateActivitiesFromExistingData();
    } catch (error) {
      console.log("🌐 Activities API error, generating from existing data:", error.message);
      generateActivitiesFromExistingData();
    } finally {
      dispatch({ type: "SET_ACTIVITIES_LOADING", payload: false });
    }
  };

  const generateActivitiesFromExistingData = async () => {
    try {
      console.log("🔄 Generating activities from existing data...");
      const activities = [];
      const now = new Date();

      if (state.deals && state.deals.length > 0) {
        const recentDeals = state.deals
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        recentDeals.forEach((deal) => {
          activities.push({
            _id: `deal-activity-${deal.id}`,
            user: deal.buyer || { _id: "user", fullName: "User", email: "user@example.com" },
            action: deal.status === "pending" ? "created" : deal.status,
            entityType: "deal",
            entityId: deal.id,
            description: `${deal.status === "pending" ? "created" : deal.status} deal for ${
              deal.item?.title || "item"
            }`,
            timestamp: deal.createdAt || new Date(now.getTime() - Math.random() * 86400000).toISOString(),
            metadata: { dealId: deal.dealId, price: deal.originalPrice, autoGenerated: true },
          });
        });
      }

      if (state.consultations && state.consultations.length > 0) {
        const recentConsultations = state.consultations
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        recentConsultations.forEach((consultation) => {
          activities.push({
            _id: `consult-activity-${consultation.id}`,
            user: {
              _id: "user",
              fullName: consultation.fullName,
              email: consultation.email,
            },
            action: consultation.status === "pending" ? "created" : consultation.status,
            entityType: "consultation",
            entityId: consultation.id,
            description: `${consultation.status === "pending" ? "booked" : consultation.status} ${
              consultation.type
            } consultation`,
            timestamp:
              consultation.createdAt ||
              new Date(now.getTime() - Math.random() * 172800000).toISOString(),
            metadata: { category: consultation.category, mode: consultation.mode, autoGenerated: true },
          });
        });
      }

      if (state.cars && state.cars.length > 0) {
        const recentCars = state.cars
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 2);
        recentCars.forEach((car) => {
          activities.push({
            _id: `car-activity-${car.id}`,
            user: { _id: "user", fullName: "Seller", email: "seller@example.com" },
            action: "created",
            entityType: "car",
            entityId: car.id,
            description: `added car: ${car.title}`,
            timestamp: car.createdAt || new Date(now.getTime() - Math.random() * 259200000).toISOString(),
            metadata: { make: car.make, model: car.model, price: car.price, autoGenerated: true },
          });
        });
      }

      if (state.houses && state.houses.length > 0) {
        const recentHouses = state.houses
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 2);
        recentHouses.forEach((house) => {
          activities.push({
            _id: `property-activity-${house.id}`,
            user: { _id: "user", fullName: "Seller", email: "seller@example.com" },
            action: "created",
            entityType: "property",
            entityId: house.id,
            description: `added property: ${house.title}`,
            timestamp: house.createdAt || new Date(now.getTime() - Math.random() * 345600000).toISOString(),
            metadata: {
              propertyType: house.propertyType,
              bedrooms: house.bedrooms,
              price: house.price,
              autoGenerated: true,
            },
          });
        });
      }

      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      console.log(`✅ Generated ${activities.length} activities from existing data`);
      dispatch({ type: "SET_ACTIVITIES", payload: activities });
    } catch (error) {
      console.error("❌ Error generating activities from existing data:", error);
      dispatch({ type: "SET_ACTIVITIES", payload: [] });
    }
  };

  const logActivity = async (action: string, entityType: string, description: string, entityId?: string) => {
    try {
      const token = authService.getStoredToken();
      if (!token) return;

      const activityData = {
        action,
        entityType,
        entityId,
        description,
        metadata: {},
      };

      const response = await fetch("https://car-house-land.onrender.com/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success" && result.activity) {
          dispatch({ type: "ADD_ACTIVITY", payload: result.activity });
        }
      }
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const getRecentActivities = () => {
    return state.activities;
  };

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("userCart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          dispatch({ type: "SET_CART", payload: parsedCart });
        }
      }

      const savedFavorites = localStorage.getItem("userFavorites");
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        if (Array.isArray(parsedFavorites)) {
          dispatch({ type: "SET_FAVORITES", payload: parsedFavorites });
        }
      }

      const savedDeals = localStorage.getItem("deals");
      if (savedDeals) {
        const parsedDeals = JSON.parse(savedDeals);
        if (Array.isArray(parsedDeals)) {
          dispatch({ type: "SET_DEALS", payload: parsedDeals });
        }
      }

      fetchRecentActivities();
      loadCarsFromAPI();
      loadHousesFromAPI();
      loadLandsFromAPI();
      loadMachinesFromAPI();

      const savedMachines = localStorage.getItem("machinesData");
      if (savedMachines) {
        const parsedMachines = JSON.parse(savedMachines);
        if (Array.isArray(parsedMachines)) {
          const mergedMachines = [...MACHINES_DATA];
          parsedMachines.forEach((savedMachine: Machine) => {
            if (!mergedMachines.find((machine) => machine.id === savedMachine.id)) {
              mergedMachines.push(savedMachine);
            }
          });
          dispatch({ type: "SET_MACHINES", payload: mergedMachines });
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (auth.user) {
      loadDealsFromAPI();
    }
  }, [auth.user]);

  useEffect(() => {
    if (state.cart) {
      localStorage.setItem("userCart", JSON.stringify(state.cart));
    }
  }, [state.cart]);

  useEffect(() => {
    if (state.favorites) {
      localStorage.setItem("userFavorites", JSON.stringify(state.favorites));
    }
  }, [state.favorites]);

  const value: AppContextType = {
    ...state,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    authLoading: auth.loading,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    setIsAuthModalOpen,
    createDeal,
    updateDealStatus,
    refreshCars,
    refreshHouses,
    refreshLands,
    refreshMachines,
    refreshDeals,
    getPendingDealsCount: () => state.deals.filter((deal) => deal.status === "pending").length,
    getUserDeals: () => (auth.user ? state.deals.filter((deal) => deal.userId === auth.user._id) : []),
    getAdminDeals: () => state.deals,
    addCar,
    updateCar,
    deleteCar,
    addHouse,
    updateHouse,
    deleteHouse,
    addMachine,
    updateMachine,
    deleteMachine,
    addLand,
    updateLand,
    deleteLand,
    createConsultation,
    updateConsultationStatus,
    fetchConsultations,
    refreshConsultations,
    getPendingConsultationsCount: () => state.consultations.filter((c) => c.status === "pending").length,
    fetchRecentActivities,
    logActivity,
    getRecentActivities,
  };

  return (
    <AppContext.Provider value={value}>
      <Suspense fallback={null}>
        <SearchParamsHandler onAuthRequired={handleAuthRequired} />
      </Suspense>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}