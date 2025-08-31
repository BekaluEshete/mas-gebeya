import { MachineDetail } from "@/components/pages/machine-detail"

interface MachineDetailPageProps {
  params: { id: string }
}

export default function MachineDetailPage({ params }: MachineDetailPageProps) {
  return <MachineDetail machineId={params.id} />
}
