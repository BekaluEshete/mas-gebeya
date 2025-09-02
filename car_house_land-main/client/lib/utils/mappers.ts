import type { Car, Deal } from "@/types"

// Map API response to our Car interface
export function mapApiCarToLocal(apiCar: any): Car {
  return {
    id: apiCar._id || apiCar.id,
    title: apiCar.title,
    make: apiCar.make,
    model: apiCar.model,
    year: apiCar.year,
    price: apiCar.price,
    mileage: apiCar.mileage || 0,
    fuelType: apiCar.fuelType,
    transmission: apiCar.transmission,
    condition: apiCar.condition,
    location: `${apiCar.city || ""}, ${apiCar.region || ""}`.replace(/^,\s*|,\s*$/g, "") || "Location not specified",
    city: apiCar.city || "Unknown City",
    region: apiCar.region || "Unknown Region",
    address: apiCar.address || "Address not specified",
    kebele: apiCar.kebele,
    images: apiCar.images?.map((img: any) => img.url) || ["/classic-red-convertible.png"],
    status: apiCar.status === "available" ? "available" : apiCar.status === "sold" ? "sold" : "pending",
    rating: 4.5, // Default rating since API doesn't provide this
    reviews: Math.floor(Math.random() * 50) + 1, // Random reviews count
    description: apiCar.description,
    featured: Math.random() > 0.7, // Random featured status
    createdAt: apiCar.createdAt || new Date().toISOString(),
    sellerId: apiCar.owner || "unknown",
    sellerName: "Car Dealer", // Default seller name
    sellerPhone: "+251911234567", // Default phone
    sellerEmail: "dealer@example.com", // Default email
    bodyType: apiCar.bodyType || "sedan",
    color: apiCar.color || "Unknown",
    engine: "2.0L", // Default engine since API doesn't provide this
    listingType: apiCar.type === "sale" ? "sale" : "rent",
  }
}

export function mapApiDealToLocal(apiDeal: any): Deal {
  if (!apiDeal) {
    throw new Error("apiDeal is null or undefined")
  }

  return {
    _id: apiDeal._id || `deal-${Date.now()}`,
    id: apiDeal._id || `deal-${Date.now()}`, // For compatibility
    dealId: apiDeal.dealId || `DEAL-${Date.now()}`,

    // Map buyer and seller info
    buyer: {
      _id: apiDeal.buyer?._id || apiDeal.buyer || "unknown-buyer",
      fullName: apiDeal.buyer?.fullName || "Unknown Buyer",
      email: apiDeal.buyer?.email || "",
      phone: apiDeal.buyer?.phone || "",
    },
    seller: {
      _id: apiDeal.seller?._id || apiDeal.seller || "unknown-seller",
      fullName: apiDeal.seller?.fullName || "Unknown Seller",
      email: apiDeal.seller?.email || "",
      phone: apiDeal.seller?.phone || "",
    },

    // Map item info
    item: {
      _id: apiDeal.item?._id || apiDeal.item || "unknown-item",
      title: apiDeal.item?.title || "Unknown Item",
      price: apiDeal.item?.price || 0,
      images: apiDeal.item?.images || [],
      description: apiDeal.item?.description || "",
      location: apiDeal.item?.location || apiDeal.item?.city || "Unknown Location",
    },
    itemType: apiDeal.itemType || "car",

    // Deal details
    dealType: apiDeal.dealType || "inquiry",
    message: apiDeal.message || "",
    userMessage: apiDeal.message || "", // For compatibility
    originalPrice: apiDeal.item?.price || 0,
    userOfferPrice: apiDeal.userOfferPrice || 0,

    // Status and timestamps
    status: apiDeal.status || "pending",
    createdAt: apiDeal.createdAt || new Date().toISOString(),
    updatedAt: apiDeal.updatedAt || new Date().toISOString(),
    completedAt: apiDeal.completedAt,
    cancelledAt: apiDeal.cancelledAt,
    cancellationReason: apiDeal.cancellationReason,

    // Legacy compatibility fields
    itemId: apiDeal.item?._id || apiDeal.item || "unknown-item",
    userId: apiDeal.buyer?._id || apiDeal.buyer || "unknown-user",
    userName: apiDeal.buyer?.fullName || "Unknown User",
    userEmail: apiDeal.buyer?.email || "",
    userPhone: apiDeal.buyer?.phone || "",
    chatHistory: [],
    adminInfo: {
      name: "Alemayehu Bekele",
      email: "admin@ethiopiapropertyauto.com",
      phone: "+251 911 123 456",
      telegram: "@ethiopiapropertyauto_admin",
      whatsapp: "+251-911-123-456",
    },
  }
}
