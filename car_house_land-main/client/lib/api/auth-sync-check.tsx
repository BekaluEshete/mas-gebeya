// app/auth-sync-check/page.tsx
import { NextResponse } from "next/server"

export default function AuthSyncCheck() {
  return null // No UI needed, just a route for middleware to process
}

export async function GET(request: Request) {
  return NextResponse.json({ status: "ok" })
}