import { LandDetail } from "@/components/pages/land-detail"

interface LandDetailPageProps {
  params: { id: string }
}

export default function LandDetailPage({ params }: LandDetailPageProps) {
  return <LandDetail landId={params.id} />
}
