import Link from "next/link"
import { AdminDashboard } from "@/components/pages/admin-dashboard"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="px-4 pt-4">
        <Button asChild>
          <Link href="/admin/consultants">Review Consultant Applications</Link>
        </Button>
      </div>
      <AdminDashboard />
    </div>
  )
}
