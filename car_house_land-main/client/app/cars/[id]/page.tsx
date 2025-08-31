import { CarDetail } from "@/components/pages/car-detail"

interface CarDetailPageProps {
  params: { id: string }
}

export default function CarDetailPage({ params }: CarDetailPageProps) {
  return <CarDetail carId={params.id} />
}
