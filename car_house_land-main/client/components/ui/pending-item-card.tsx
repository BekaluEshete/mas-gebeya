import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, MapPin, DollarSign, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PendingItemProps {
    item: any
    type: string
    onApprove: (type: string, id: string) => void
    onReject: (type: string, id: string) => void
}

export function PendingItemCard({ item, type, onApprove, onReject }: PendingItemProps) {
    return (
        <Card className="overflow-hidden border-orange-200">
            <div className="relative h-48 bg-gray-100">
                <img
                    src={item.images?.[0]?.url || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-orange-500">Pending Approval</Badge>
            </div>
            <CardContent className="p-4 space-y-2">
                <h4 className="font-bold truncate">{item.title}</h4>
                <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {item.price?.toLocaleString()} ETB
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {item.city}, {item.region}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    {item.owner?.name || item.owner?.email || "Unknown User"}
                </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-4 flex gap-2">
                <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onApprove(type, item._id)}
                >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => onReject(type, item._id)}
                >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
            </CardFooter>
        </Card>
    )
}
