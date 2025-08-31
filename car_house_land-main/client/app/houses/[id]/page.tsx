import { HouseDetail } from "@/components/pages/house-detail"

interface HouseDetailPageProps {
  params: { id: string }
}

export default function HouseDetailPage({ params }: HouseDetailPageProps) {
  return <HouseDetail houseId={params.id} />
}
