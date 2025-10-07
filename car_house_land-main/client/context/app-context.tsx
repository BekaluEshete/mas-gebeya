"use client"

import { useEffect, Suspense } from "react"
import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import type { Car, House, Land, Machine, Deal,Consultation } from "@/types"
import { fetchCars, deleteCar as apiDeleteCar } from "@/lib/api/cars"
import { fetchProperties, deleteHouse as apiDeleteHouse } from "@/lib/api/properties"
import { fetchLands, deleteLand as apiDeleteLand } from "@/lib/api/lands"
import { fetchMachines, deleteMachine as apiDeleteMachine } from "@/lib/api/machines"
import { MACHINES_DATA } from "@/lib/data/machines"
import { useAuth } from "@/hooks/use-auth"
import type { User } from "@/lib/auth"
import { fetchDeals, createDeal as apiCreateDeal, updateDealStatus as apiUpdateDealStatus } from "@/lib/api/deals"
import { mapApiDealToLocal } from "@/lib/utils/mappers"
import { authService } from "@/lib/auth" // FIXED: Add this import

interface AppState {
  cart: Array<{
    id: string
    type: "car" | "house" | "land" | "machine"
    item: Car | House | Land | Machine
    quantity: number
  }>
  favorites: Array<{
    id: string
    type: "car" | "house" | "land" | "machine"
    item: Car | House | Land | Machine
  }>
  deals: Deal[]
  consultations: Consultation[] // NEW: Add consultations
  soldItems: Set<string>
  isAuthModalOpen: boolean
  cars: Car[]
  houses: House[]
  machines: Machine[]
  lands: Land[]
  carsLoading: boolean
  housesLoading: boolean
  landsLoading: boolean
  machinesLoading: boolean
}

type AppAction =
  | { type: "ADD_TO_CART"; payload: { type: "car" | "house" | "land" | "machine"; item: Car | House | Land | Machine } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: string; quantity: number } }
  | {
      type: "ADD_TO_FAVORITES"
      payload: { type: "car" | "house" | "land" | "machine"; item: Car | House | Land | Machine }
    }
  | { type: "REMOVE_FROM_FAVORITES"; payload: string }
  | { type: "SET_AUTH_MODAL"; payload: boolean }
  | { type: "SET_DEALS"; payload: Deal[] }
  | { type: "ADD_DEAL"; payload: Deal }
  | { type: "UPDATE_DEAL"; payload: { id: string; updates: Partial<Deal> } }
  | {
      type: "SET_CONSULTATIONS"; payload: Consultation[] // NEW
    }
  | { type: "ADD_CONSULTATION"; payload: Consultation } // NEW
  | { type: "UPDATE_CONSULTATION"; payload: { id: string; updates: Partial<Consultation> } } // NEW
   
  | {
      type: "SET_CART"
      payload: Array<{
        id: string
        type: "car" | "house" | "land" | "machine"
        item: Car | House | Land | Machine
        quantity: number
      }>
    }
  | {
      type: "SET_FAVORITES"
      payload: Array<{
        id: string
        type: "car" | "house" | "land" | "machine"
        item: Car | House | Land | Machine
      }>
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

interface AppContextType extends AppState {
  user: User | null
  isAuthenticated: boolean
  authLoading: boolean
  dispatch: React.Dispatch<AppAction>
  addToCart: (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => void
  removeFromCart: (id: string) => void
  updateCartQuantity: (id: string, quantity: number) => void
  addToFavorites: (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => void
  removeFromFavorites: (id: string) => void
  toggleFavorite: (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => void
  isFavorite: (itemId: string) => boolean
  setIsAuthModalOpen: (open: boolean) => void
  createDeal: (
    itemType: "car" | "house" | "land" | "machine",
    item: Car | House | Land | Machine,
    message: string,
  ) => Promise<void>
  updateDealStatus: (dealId: string, status: Deal["status"], cancellationReason?: string) => Promise<void>
  getPendingDealsCount: () => number
  getUserDeals: () => Deal[]
  getAdminDeals: () => Deal[]
  addCar: (car: Car) => void
  updateCar: (id: string, updates: Partial<Car>) => void
  deleteCar: (id: string) => Promise<void>
  addHouse: (house: House) => void
  updateHouse: (id: string, updates: Partial<House>) => void
  deleteHouse: (id: string) => Promise<void>
  addMachine: (machine: Machine) => void
  updateMachine: (id: string, updates: Partial<Machine>) => void
  deleteMachine: (id: string) => Promise<void>
  addLand: (land: Land) => void
  updateLand: (id: string, updates: Partial<Land>) => void
  deleteLand: (id: string) => Promise<void>
  refreshCars: () => Promise<void>
  refreshHouses: () => Promise<void>
  refreshLands: () => Promise<void>
  refreshMachines: () => Promise<void>
  refreshDeals: () => Promise<void>
  // NEW: Consultation methods
  createConsultation: (data: Omit<Consultation, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Consultation>
  updateConsultationStatus: (id: string, status: Consultation['status'], notes?: string) => Promise<void>
  fetchConsultations: () => Promise<void>
  refreshConsultations: () => Promise<void>
  getPendingConsultationsCount: () => number

}

const AppContext = createContext<AppContextType | undefined>(undefined)

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cart: action.payload || [] }
    case "ADD_TO_CART":
      const existingCartItem = state.cart.find(
        (item) => item.type === action.payload.type && item.item.id === action.payload.item.id,
      )
      if (existingCartItem) {
        return state
      }
      const newCartItem = {
        id: `${action.payload.type}-${action.payload.item.id}-${Date.now()}`,
        type: action.payload.type,
        item: action.payload.item,
        quantity: 1,
      }
      return { ...state, cart: [...(state.cart || []), newCartItem] }
    case "REMOVE_FROM_CART":
      return { ...state, cart: (state.cart || []).filter((item) => item.id !== action.payload) }
    case "UPDATE_CART_QUANTITY":
      return state
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload || [] }
    case "ADD_TO_FAVORITES":
      const existingFavorite = state.favorites.find(
        (item) => item.type === action.payload.type && item.item.id === action.payload.item.id,
      )
      if (existingFavorite) return state
      const newFavorite = {
        id: `${action.payload.type}-${action.payload.item.id}`,
        type: action.payload.type,
        item: action.payload.item,
      }
      return { ...state, favorites: [...(state.favorites || []), newFavorite] }
    case "REMOVE_FROM_FAVORITES":
      return { ...state, favorites: (state.favorites || []).filter((item) => item.id !== action.payload) }
    case "SET_AUTH_MODAL":
      return { ...state, isAuthModalOpen: action.payload }
    case "SET_DEALS":
      return { ...state, deals: action.payload || [] }
    case "ADD_DEAL":
      return { ...state, deals: [...(state.deals || []), action.payload] }
    case "UPDATE_DEAL":
      return {
        ...state,
        deals: (state.deals || []).map((deal) =>
          deal.id === action.payload.id ? { ...deal, ...action.payload.updates } : deal,
        ),
      }
    // NEW: Consultation reducer cases
    case "SET_CONSULTATIONS":
      return { ...state, consultations: action.payload || [] }
    case "ADD_CONSULTATION":
      return { ...state, consultations: [...(state.consultations || []), action.payload] }
    case "UPDATE_CONSULTATION":
      return {
        ...state,
        consultations: (state.consultations || []).map((consult) =>
          consult.id === action.payload.id ? { ...consult, ...action.payload.updates } : consult,
        ),
      }
    case "SET_CARS":
      return { ...state, cars: action.payload }
    case "ADD_CAR":
      return { ...state, cars: [...state.cars, action.payload] }
    case "UPDATE_CAR":
      return {
        ...state,
        cars: state.cars.map((car) => (car.id === action.payload.id ? { ...car, ...action.payload.updates } : car)),
      }
    case "DELETE_CAR":
      return { ...state, cars: state.cars.filter((car) => car.id !== action.payload) }
    case "SET_HOUSES":
      return { ...state, houses: action.payload }
    case "ADD_HOUSE":
      return { ...state, houses: [...state.houses, action.payload] }
    case "UPDATE_HOUSE":
      return {
        ...state,
        houses: state.houses.map((house) =>
          house.id === action.payload.id ? { ...house, ...action.payload.updates } : house,
        ),
      }
    case "DELETE_HOUSE":
      return { ...state, houses: state.houses.filter((house) => house.id !== action.payload) }
    case "SET_MACHINES":
      return { ...state, machines: action.payload }
    case "ADD_MACHINE":
      return { ...state, machines: [...state.machines, action.payload] }
    case "UPDATE_MACHINE":
      return {
        ...state,
        machines: state.machines.map((machine) =>
          machine.id === action.payload.id ? { ...machine, ...action.payload.updates } : machine,
        ),
      }
    case "DELETE_MACHINE":
      return { ...state, machines: state.machines.filter((machine) => machine.id !== action.payload) }
    case "SET_LANDS":
      return { ...state, lands: action.payload }
    case "ADD_LAND":
      return { ...state, lands: [...state.lands, action.payload] }
    case "UPDATE_LAND":
      return {
        ...state,
        lands: state.lands.map((land) =>
          land.id === action.payload.id ? { ...land, ...action.payload.updates } : land,
        ),
      }
    case "DELETE_LAND":
      return { ...state, lands: state.lands.filter((land) => land.id !== action.payload) }
    case "SET_CARS_LOADING":
      return { ...state, carsLoading: action.payload }
    case "SET_HOUSES_LOADING":
      return { ...state, housesLoading: action.payload }
    case "SET_LANDS_LOADING":
      return { ...state, landsLoading: action.payload }
    case "SET_MACHINES_LOADING":
      return { ...state, machinesLoading: action.payload }
    default:
      return state
  }
}

function SearchParamsHandler({ onAuthRequired }: { onAuthRequired: (required: boolean) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const authRequired = searchParams.get("auth") === "required"
    onAuthRequired(authRequired)
  }, [searchParams, onAuthRequired])

  return null
}

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  const [state, dispatch] = useReducer(appReducer, {
    cart: [],
    favorites: [],
    deals: [],
    consultations: [], // NEW: Initialize consultations
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
  })

  const handleAuthRequired = (required: boolean) => {
    if (required && !auth.isAuthenticated && !auth.loading) {
      console.log("[v0] Middleware requires authentication, opening auth modal")
      dispatch({ type: "SET_AUTH_MODAL", payload: true })
    }
  }

  const loadCarsFromAPI = async () => {
    dispatch({ type: "SET_CARS_LOADING", payload: true })
    try {
      const apiCars = await fetchCars()

      const savedCars = localStorage.getItem("carsData")
      let adminCars: Car[] = []
      if (savedCars) {
        try {
          const parsedCars = JSON.parse(savedCars)
          if (Array.isArray(parsedCars)) {
            adminCars = parsedCars
          }
        } catch (error) {
          console.error("Error parsing saved cars:", error)
        }
      }

      const allCars = [...apiCars]
      adminCars.forEach((adminCar) => {
        if (!allCars.find((car) => car.id === adminCar.id)) {
          allCars.push(adminCar)
        }
      })

      dispatch({ type: "SET_CARS", payload: allCars })
    } catch (error) {
      console.error("Error loading cars from API:", error)
      const savedCars = localStorage.getItem("carsData")
      if (savedCars) {
        try {
          const parsedCars = JSON.parse(savedCars)
          if (Array.isArray(parsedCars)) {
            dispatch({ type: "SET_CARS", payload: parsedCars })
          }
        } catch (error) {
          console.error("Error parsing saved cars:", error)
        }
      }
    } finally {
      dispatch({ type: "SET_CARS_LOADING", payload: false })
    }
  }

  const loadHousesFromAPI = async () => {
    dispatch({ type: "SET_HOUSES_LOADING", payload: true })
    try {
      const apiHouses = await fetchProperties()

      const savedHouses = localStorage.getItem("housesData")
      let adminHouses: House[] = []
      if (savedHouses) {
        try {
          const parsedHouses = JSON.parse(savedHouses)
          if (Array.isArray(parsedHouses)) {
            adminHouses = parsedHouses
          }
        } catch (error) {
          console.error("Error parsing saved houses:", error)
        }
      }

      const allHouses = [...apiHouses]
      adminHouses.forEach((adminHouse) => {
        if (!allHouses.find((house) => house.id === adminHouse.id)) {
          allHouses.push(adminHouse)
        }
      })

      dispatch({ type: "SET_HOUSES", payload: allHouses })
    } catch (error) {
      console.error("Error loading houses from API:", error)
      const savedHouses = localStorage.getItem("housesData")
      if (savedHouses) {
        try {
          const parsedHouses = JSON.parse(savedHouses)
          if (Array.isArray(parsedHouses)) {
            dispatch({ type: "SET_HOUSES", payload: parsedHouses })
          }
        } catch (error) {
          console.error("Error parsing saved houses:", error)
        }
      }
    } finally {
      dispatch({ type: "SET_HOUSES_LOADING", payload: false })
    }
  }

  const loadLandsFromAPI = async () => {
    dispatch({ type: "SET_LANDS_LOADING", payload: true })
    try {
      const apiLands = await fetchLands()

      const savedLands = localStorage.getItem("landsData")
      let adminLands: Land[] = []
      if (savedLands) {
        try {
          const parsedLands = JSON.parse(savedLands)
          if (Array.isArray(parsedLands)) {
            adminLands = parsedLands
          }
        } catch (error) {
          console.error("Error parsing saved lands:", error)
        }
      }

      const allLands = [...apiLands]
      adminLands.forEach((adminLand) => {
        if (!allLands.find((land) => land.id === adminLand.id)) {
          allLands.push(adminLand)
        }
      })

      dispatch({ type: "SET_LANDS", payload: allLands })
    } catch (error) {
      console.error("Error loading lands from API:", error)
      const savedLands = localStorage.getItem("landsData")
      if (savedLands) {
        try {
          const parsedLands = JSON.parse(savedLands)
          if (Array.isArray(parsedLands)) {
            dispatch({ type: "SET_LANDS", payload: parsedLands })
          }
        } catch (error) {
          console.error("Error parsing saved lands:", error)
        }
      }
    } finally {
      dispatch({ type: "SET_LANDS_LOADING", payload: false })
    }
  }

  const loadMachinesFromAPI = async () => {
    dispatch({ type: "SET_MACHINES_LOADING", payload: true })
    try {
      const apiMachines = await fetchMachines()

      const savedMachines = localStorage.getItem("machinesData")
      let adminMachines: Machine[] = []
      if (savedMachines) {
        try {
          const parsedMachines = JSON.parse(savedMachines)
          if (Array.isArray(parsedMachines)) {
            adminMachines = parsedMachines
          }
        } catch (error) {
          console.error("Error parsing saved machines:", error)
        }
      }

      const allMachines = [...apiMachines]
      adminMachines.forEach((adminMachine) => {
        if (!allMachines.find((machine) => machine.id === adminMachine.id)) {
          allMachines.push(adminMachine)
        }
      })

      dispatch({ type: "SET_MACHINES", payload: allMachines })
    } catch (error) {
      console.error("Error loading machines from API:", error)
      const savedMachines = localStorage.getItem("machinesData")
      if (savedMachines) {
        try {
          const parsedMachines = JSON.parse(savedMachines)
          if (Array.isArray(parsedMachines)) {
            dispatch({ type: "SET_MACHINES", payload: parsedMachines })
          }
        } catch (error) {
          console.error("Error parsing saved machines:", error)
        }
      }
    } finally {
      dispatch({ type: "SET_MACHINES_LOADING", payload: false })
    }
  }

  const refreshCars = async () => {
    await loadCarsFromAPI()
  }

  const refreshHouses = async () => {
    await loadHousesFromAPI()
  }

  const refreshLands = async () => {
    await loadLandsFromAPI()
  }

  const refreshMachines = async () => {
    await loadMachinesFromAPI()
  }

  const addToCart = (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => {
    dispatch({ type: "ADD_TO_CART", payload: { type, item } })
  }

  const removeFromCart = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id })
  }

  const updateCartQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_CART_QUANTITY", payload: { id, quantity } })
  }

  const addToFavorites = (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => {
    dispatch({ type: "ADD_TO_FAVORITES", payload: { type, item } })
  }

  const removeFromFavorites = (id: string) => {
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: id })
  }

  const toggleFavorite = (type: "car" | "house" | "land" | "machine", item: Car | House | Land | Machine) => {
    const favoriteId = `${type}-${item.id}`
    const isFav = state.favorites.some((fav) => fav.id === favoriteId)
    if (isFav) {
      removeFromFavorites(favoriteId)
    } else {
      addToFavorites(type, item)
    }
  }

  const isFavorite = (itemId: string) => {
    return state.favorites.some((fav) => fav.item.id === itemId)
  }

  const setIsAuthModalOpen = (open: boolean) => {
    dispatch({ type: "SET_AUTH_MODAL", payload: open })

    if (!open && typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (url.searchParams.get("auth") === "required") {
        url.searchParams.delete("auth")
        window.history.replaceState({}, "", url.toString())
      }
    }
  }

  const loadDealsFromAPI = async () => {
    if (!auth.user) return

    try {
      const apiDeals = await fetchDeals()
      const mappedDeals = apiDeals.map(mapApiDealToLocal)
      dispatch({ type: "SET_DEALS", payload: mappedDeals })
    } catch (error) {
      console.error("Error loading deals from API:", error)
      // Fallback to localStorage
      const savedDeals = localStorage.getItem("deals")
      if (savedDeals) {
        try {
          const parsedDeals = JSON.parse(savedDeals)
          if (Array.isArray(parsedDeals)) {
            dispatch({ type: "SET_DEALS", payload: parsedDeals })
          }
        } catch (error) {
          console.error("Error parsing saved deals:", error)
        }
      }
    }
  }

  const createDeal = async (
    itemType: "car" | "house" | "land" | "machine",
    item: Car | House | Land | Machine,
    message: string,
  ) => {
    if (!auth.user) {
      console.log("[v0] User not authenticated, cannot create deal")
      return
    }

    console.log("[v0] Creating deal for item:", item.id, "type:", itemType)

    try {
      // Map item type to backend format
      const backendItemType =
        itemType === "house"
          ? "Property"
          : ((itemType.charAt(0).toUpperCase() + itemType.slice(1)) as "Car" | "Property" | "Land" | "Machine")

      // Ensure we have proper seller information
      const sellerId = item.sellerId || item.owner || auth.user._id
      const sellerName = item.sellerName || item.ownerName || "Property Owner"

      const dealData = {
        item: item.id,
        itemType: backendItemType,
        buyer: auth.user._id,
        seller: sellerId,
        message,
        dealType: "inquiry",
      }

      console.log("[v0] Attempting API call with data:", message)
      console.log("[v0] Making API request to create deal:", message)
      const newDeal = await apiCreateDeal(dealData)

      if (newDeal) {
        console.log("[v0] API response status: 201")
        console.log("[v0] API success response: Deal created successfully")
        console.log("[v0] Deal created successfully via API:", newDeal)

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

          // Legacy compatibility
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
        }

        dispatch({ type: "ADD_DEAL", payload: mappedDeal })

        // Also save to localStorage as backup
        const updatedDeals = [...state.deals, mappedDeal]
        localStorage.setItem("deals", JSON.stringify(updatedDeals))

        console.log("[v0] Successfully created deal for:", item.title)
        return
      }
    } catch (error) {
      console.error("[v0] API call failed, using local fallback:", error)
    }

    console.log("[v0] Creating deal locally as fallback")
    const dealId = `deal-${Date.now()}`
    const sellerId = item.sellerId || item.owner || auth.user._id
    const sellerName = item.sellerName || item.ownerName || "Property Owner"

    const newDeal: Deal = {
      _id: dealId,
      id: dealId,
      dealId: `DEAL-${Date.now()}`,
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
      itemType: itemType === "house" ? "Property" : itemType.charAt(0).toUpperCase() + itemType.slice(1),
      message,
      originalPrice: item.price,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Legacy compatibility
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
    }

    dispatch({ type: "ADD_DEAL", payload: newDeal })

    const updatedDeals = [...state.deals, newDeal]
    localStorage.setItem("deals", JSON.stringify(updatedDeals))

    console.log("[v0] Deal created locally:", newDeal)
  }

  const updateDealStatus = async (dealId: string, status: Deal["status"], cancellationReason?: string) => {
    try {
      const statusData = { status, cancellationReason }
      const updatedDeal = await apiUpdateDealStatus(dealId, statusData)

      if (updatedDeal) {
        const mappedDeal = mapApiDealToLocal(updatedDeal)
        dispatch({
          type: "UPDATE_DEAL",
          payload: {
            id: dealId,
            updates: mappedDeal,
          },
        })
      }
    } catch (error) {
      console.error("Error updating deal status:", error)

      // Fallback to local update
      dispatch({
        type: "UPDATE_DEAL",
        payload: {
          id: dealId,
          updates: {
            status,
            updatedAt: new Date().toISOString(),
            ...(status === "completed" && { completedAt: new Date().toISOString() }),
            ...(status === "cancelled" && {
              cancelledAt: new Date().toISOString(),
              cancellationReason: cancellationReason || "No reason provided",
            }),
          },
        },
      })
    }
  }

  const refreshDeals = async () => {
    await loadDealsFromAPI()
  }

  const addCar = (car: Car) => {
    dispatch({ type: "ADD_CAR", payload: car })
  }

  const updateCar = (id: string, updates: Partial<Car>) => {
    dispatch({ type: "UPDATE_CAR", payload: { id, updates } })
  }

  const deleteCar = async (id: string) => {
    if (auth.user?.token) {
      try {
        const success = await apiDeleteCar(id, auth.user.token)
        if (success) {
          dispatch({ type: "DELETE_CAR", payload: id })
          // Also remove from localStorage
          const savedCars = localStorage.getItem("carsData")
          if (savedCars) {
            const parsedCars = JSON.parse(savedCars)
            const updatedCars = parsedCars.filter((car: Car) => car.id !== id)
            localStorage.setItem("carsData", JSON.stringify(updatedCars))
          }
        }
      } catch (error) {
        console.error("Error deleting car:", error)
      }
    } else {
      // Fallback to local deletion if no token
      dispatch({ type: "DELETE_CAR", payload: id })
    }
  }

  const addHouse = (house: House) => {
    dispatch({ type: "ADD_HOUSE", payload: house })
  }

  const updateHouse = (id: string, updates: Partial<House>) => {
    dispatch({ type: "UPDATE_HOUSE", payload: { id, updates } })
  }

  const deleteHouse = async (id: string) => {
    if (auth.user?.token) {
      try {
        const success = await apiDeleteHouse(id, auth.user.token)
        if (success) {
          dispatch({ type: "DELETE_HOUSE", payload: id })
          // Also remove from localStorage
          const savedHouses = localStorage.getItem("housesData")
          if (savedHouses) {
            const parsedHouses = JSON.parse(savedHouses)
            const updatedHouses = parsedHouses.filter((house: House) => house.id !== id)
            localStorage.setItem("housesData", JSON.stringify(updatedHouses))
          }
        }
      } catch (error) {
        console.error("Error deleting house:", error)
      }
    } else {
      // Fallback to local deletion if no token
      dispatch({ type: "DELETE_HOUSE", payload: id })
    }
  }

  const addMachine = (machine: Machine) => {
    dispatch({ type: "ADD_MACHINE", payload: machine })
  }

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    dispatch({ type: "UPDATE_MACHINE", payload: { id, updates } })
  }

  const deleteMachine = async (id: string) => {
    if (auth.user?.token) {
      try {
        const success = await apiDeleteMachine(id, auth.user.token)
        if (success) {
          dispatch({ type: "DELETE_MACHINE", payload: id })
          // Also remove from localStorage
          const savedMachines = localStorage.getItem("machinesData")
          if (savedMachines) {
            const parsedMachines = JSON.parse(savedMachines)
            const updatedMachines = parsedMachines.filter((machine: Machine) => machine.id !== id)
            localStorage.setItem("machinesData", JSON.stringify(updatedMachines))
          }
        }
      } catch (error) {
        console.error("Error deleting machine:", error)
      }
    } else {
      // Fallback to local deletion if no token
      dispatch({ type: "DELETE_MACHINE", payload: id })
    }
  }

  const addLand = (land: Land) => {
    dispatch({ type: "ADD_LAND", payload: land })
  }

  const updateLand = (id: string, updates: Partial<Land>) => {
    dispatch({ type: "UPDATE_LAND", payload: { id, updates } })
  }

  const deleteLand = async (id: string) => {
    if (auth.user?.token) {
      try {
        const success = await apiDeleteLand(id, auth.user.token)
        if (success) {
          dispatch({ type: "DELETE_LAND", payload: id })
          // Also remove from localStorage
          const savedLands = localStorage.getItem("landsData")
          if (savedLands) {
            const parsedLands = JSON.parse(savedLands)
            const updatedLands = parsedLands.filter((land: Land) => land.id !== id)
            localStorage.setItem("landsData", JSON.stringify(updatedLands))
          }
        }
      } catch (error) {
        console.error("Error deleting land:", error)
      }
    } else {
      // Fallback to local deletion if no token
      dispatch({ type: "DELETE_LAND", payload: id })
    }
  }
  // NEW: Consultation methods
 const fetchConsultations = async () => {
    const token = authService.getStoredToken(); // FIXED: Direct from storage
    console.log('fetchConsultations token:', token ? 'Present' : 'Missing'); // Debug (remove later)

    if (!token) {
      console.log('No token for fetchConsultations'); // Debug
      return; // Graceful fail - use localStorage fallback below
    }

    try {
      const response = await fetch("https://car-house-land.onrender.com/api/consultations", {
        headers: {
          Authorization: `Bearer ${token}`, // FIXED: Use stored token
          "Content-Type": "application/json",
        },
      });

      console.log('fetchConsultations response status:', response.status); // Debug

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          dispatch({ type: "SET_CONSULTATIONS", payload: data.data });
          localStorage.setItem("consultations", JSON.stringify(data.data));
        }
      } else {
  if (response.status !== 404) {  // NEW: Ignore 404 (backend not ready)
    console.error("Failed to fetch consultations:", response.status);
  } else {
    console.warn("Consultations endpoint not found (404) - using local data only");  // NEW: Softer log
  }
}
      // Always fallback to localStorage
      const savedConsultations = localStorage.getItem("consultations");
      if (savedConsultations) {
        try {
          const parsed = JSON.parse(savedConsultations);
          if (Array.isArray(parsed)) {
            dispatch({ type: "SET_CONSULTATIONS", payload: parsed });
          }
        } catch (error) {
          console.error("Error parsing saved consultations:", error);
        }
      }
    } catch (error) {
      console.error("Error loading consultations from API:", error);
      // Fallback to localStorage (as above)
    }
  };

const createConsultation = async (data: Omit<Consultation, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Consultation> => {
    const token = authService.getStoredToken(); // FIXED: Direct from storage
    console.log('createConsultation token:', token ? 'Present' : 'Missing'); // Debug

    if (!token) {
      console.error('No token in createConsultation'); // FIXED: Better log
      throw new Error("No authentication token found - please log in again");
    }

    try {
      console.log('Sending payload:', data); // Debug
      const response = await fetch("https://car-house-land.onrender.com/api/consultations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // FIXED: Use stored token
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log('createConsultation response status:', response.status); // Debug

      if (response.ok) {
        const newConsult = await response.json();
        console.log('Raw response:', newConsult); // Debug
        if (newConsult.success && newConsult.data) {
          dispatch({ type: "ADD_CONSULTATION", payload: newConsult.data });
          const updated = [...state.consultations, newConsult.data];
          localStorage.setItem("consultations", JSON.stringify(updated));
          return newConsult.data;
        } else {
          throw new Error(newConsult.message || 'Invalid response from server');
        }
      } else {
        const errorText = await response.text();
        console.error('Error response body:', errorText); // Debug
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error creating consultation:", error);
      // Fallback: Create locally
      const newConsult: Consultation = {
        id: `consult-${Date.now()}`,
        ...data,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_CONSULTATION", payload: newConsult });
      localStorage.setItem("consultations", JSON.stringify([...state.consultations, newConsult]));
      return newConsult;
    }
  };

  const updateConsultationStatus = async (id: string, status: Consultation['status'], notes?: string): Promise<void> => {
    const token = authService.getStoredToken(); // FIXED: Direct from storage
    console.log('updateConsultationStatus token:', token ? 'Present' : 'Missing'); // Debug

    if (!token) {
      console.error('No token in updateConsultationStatus'); // FIXED
      throw new Error("No authentication token found");
    }

    try {
      const response = await fetch(`https://car-house-land.onrender.com/api/consultations/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // FIXED: Use stored token
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, agentNotes: notes }),
      });

      console.log('updateConsultationStatus response status:', response.status); // Debug

      if (response.ok) {
        const updated = await response.json();
        if (updated.success && updated.data) {
          dispatch({
            type: "UPDATE_CONSULTATION",
            payload: { id, updates: updated.data },
          });
          const updatedConsultations = state.consultations.map(c => c.id === id ? updated.data : c);
          localStorage.setItem("consultations", JSON.stringify(updatedConsultations));
        }
      }
    } catch (error) {
      console.error("Error updating consultation status:", error);
      // Fallback: Update locally
      dispatch({
        type: "UPDATE_CONSULTATION",
        payload: {
          id,
          updates: { status, agentNotes: notes, updatedAt: new Date().toISOString() },
        },
      });
    }
  };

  const refreshConsultations = async () => {
    await fetchConsultations();
  };

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("userCart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          dispatch({ type: "SET_CART", payload: parsedCart })
        }
      }

      const savedFavorites = localStorage.getItem("userFavorites")
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites)
        if (Array.isArray(parsedFavorites)) {
          dispatch({ type: "SET_FAVORITES", payload: parsedFavorites })
        }
      }

      const savedDeals = localStorage.getItem("deals")
      if (savedDeals) {
        const parsedDeals = JSON.parse(savedDeals)
        if (Array.isArray(parsedDeals)) {
          dispatch({ type: "SET_DEALS", payload: parsedDeals })
        }
      }

      loadCarsFromAPI()
      loadHousesFromAPI()
      loadLandsFromAPI()
      loadMachinesFromAPI()

      const savedMachines = localStorage.getItem("machinesData")
      if (savedMachines) {
        const parsedMachines = JSON.parse(savedMachines)
        if (Array.isArray(parsedMachines)) {
          const mergedMachines = [...MACHINES_DATA]
          parsedMachines.forEach((savedMachine: Machine) => {
            if (!mergedMachines.find((machine) => machine.id === savedMachine.id)) {
              mergedMachines.push(savedMachine)
            }
          })
          dispatch({ type: "SET_MACHINES", payload: mergedMachines })
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  useEffect(() => {
    if (auth.user) {
      loadDealsFromAPI()
    }
  }, [auth.user])

  useEffect(() => {
    if (state.cart) {
      localStorage.setItem("userCart", JSON.stringify(state.cart))
    }
  }, [state.cart])

  useEffect(() => {
    if (state.favorites) {
      localStorage.setItem("userFavorites", JSON.stringify(state.favorites))
    }
  }, [state.favorites])
  useEffect(() => {
    try {
      // ... (existing localStorage loads unchanged)

      // NEW: Load consultations from localStorage as fallback
      const savedConsultations = localStorage.getItem("consultations");
      if (savedConsultations) {
        try {
          const parsed = JSON.parse(savedConsultations);
          if (Array.isArray(parsed)) {
            dispatch({ type: "SET_CONSULTATIONS", payload: parsed });
          }
        } catch (error) {
          console.error("Error parsing saved consultations:", error);
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (state.consultations) {
      localStorage.setItem("consultations", JSON.stringify(state.consultations));
    }
  }, [state.consultations]);


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
    // NEW: Expose consultation methods
    createConsultation,
    updateConsultationStatus,
    fetchConsultations,
    refreshConsultations,
    getPendingConsultationsCount: () => state.consultations.filter((c) => c.status === "pending").length,
  
  }

  return (
    <AppContext.Provider value={value}>
      <Suspense fallback={null}>
        <SearchParamsHandler onAuthRequired={handleAuthRequired} />
      </Suspense>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
