import { API_BASE_URL } from "@/lib/config"

export interface AdminContactInfo {
  name: string
  email: string
  phone: string
}

export async function fetchAdminContact(): Promise<AdminContactInfo | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/admin/contact`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "success" && data.data) {
      return data.data
    }

    return null
  } catch (error) {
    console.error("Error fetching admin contact:", error)
    return null
  }
}

