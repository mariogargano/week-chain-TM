import Image from "next/image"
import { MapPin, Home, Bed, Bath } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PropertyHeaderProps {
  property: {
    name: string
    location: string
    description: string
    image_url: string
    status: string
  }
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
        <Image
          src={
            property.image_url || `/placeholder.svg?height=400&width=1200&query=${encodeURIComponent(property.name)}`
          }
          alt={property.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{property.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{property.location}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {property.status}
          </Badge>
        </div>

        <p className="text-muted-foreground leading-relaxed">{property.description}</p>

        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-muted-foreground" />
            <span>Vacation Home</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-muted-foreground" />
            <span>4 Bedrooms</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5 text-muted-foreground" />
            <span>3 Bathrooms</span>
          </div>
        </div>
      </div>
    </div>
  )
}
