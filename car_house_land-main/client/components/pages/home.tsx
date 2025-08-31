"use client"
import Link from "next/link"
import { ArrowRight, Car, HomeIcon, MessageCircle, Star, Users, TrendingUp, Shield, TreePine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/app-context"
import { useState, useEffect } from "react"

export function Home() {
  const { user, setIsAuthModalOpen, cars, houses, lands, machines } = useApp()

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const videos = [
    {
      src: "/videos/car.mp4",
      alt: "Modern luxury car showcase",
      category: "cars",
    },
    {
      src: "/videos/house.mp4",
      alt: "Modern architectural design showcase",
      category: "houses",
    },
    {
      src: "/videos/land.mp4",
      alt: "Beautiful landscapes and real estate plots",
      category: "lands",
    },
    {
      src: "/videos/machine.mp4",
      alt: "Construction machines and industrial equipment",
      category: "machines",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [videos.length])

  const stats = [
    { label: "ንቁ ዝርዝሮች", value: "2,500+", icon: Car, color: "brand-green" },
    { label: "ደስተኛ ደንበኞች", value: "10,000+", icon: Users, color: "brand-red" },
    { label: "የተሳካ ስምምነቶች", value: "8,500+", icon: TrendingUp, color: "brand-yellow" },
    { label: "አማካይ ደረጃ", value: "4.9/5", icon: Star, color: "brand-green" },
  ]

  const features = [
    {
      title: "ስማርት ፍለጋ እና ማጣሪያዎች",
      description: "የላቀ የፍለጋ ችሎታዎች ያላቸው ፍጹም ተሽከርካሪ ወይም ንብረት ያግኙ",
      icon: Car,
      color: "brand-green",
    },
    {
      title: "ቀጥተኛ የአከፋፋይ ውይይት",
      description: "በቀጥታ ከአከፋፋዮች እና ወኪሎች ጋር በእውነተኛ ጊዜ ይግባቡ",
      icon: MessageCircle,
      color: "brand-red",
    },
    {
      title: "ደህንነቱ የተጠበቀ ግብይቶች",
      description: "በተገነባ ጥበቃ ደህንነቱ የተጠበቀ እና ደህንነቱ የተጠበቀ ስምምነት መፍጠር",
      icon: Shield,
      color: "brand-yellow",
    },
  ]

  const featuredListings = [
    ...(cars || [])
      .filter((car) => car.featured)
      .slice(0, 2)
      .map((car) => ({
        id: `car-${car.id}`,
        title: car.title,
        price: car.price || 0,
        image: car.images?.[0] || "/placeholder.svg",
        status: car.condition === "used" ? "used" : "new",
        location: car.location || "",
        category: "car",
        href: `/cars/${car.id}`,
      })),
    ...(houses || [])
      .filter((house) => house.featured)
      .slice(0, 2)
      .map((house) => ({
        id: `house-${house.id}`,
        title: house.title,
        price: house.price || 0,
        image: house.images?.[0] || "/placeholder.svg",
        status: house.status,
        location: house.location || "",
        category: "house",
        href: `/houses/${house.id}`,
      })),
    ...(lands || [])
      .filter((land) => land.featured)
      .slice(0, 1)
      .map((land) => ({
        id: `land-${land.id}`,
        title: land.title,
        price: land.price || 0,
        image: land.images?.[0] || "/placeholder.svg",
        status: land.status,
        location: land.location || "",
        category: "land",
        href: `/lands/${land.id}`,
      })),
    ...(machines || [])
      .filter((machine) => machine.featured)
      .slice(0, 1)
      .map((machine) => ({
        id: `machine-${machine.id}`,
        title: machine.title,
        price: machine.price || 0,
        image: machine.images?.[0] || "/placeholder.svg",
        status: machine.condition,
        location: machine.location || "",
        category: "machine",
        href: `/machines/${machine.id}`,
      })),
  ]

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop&crop=center')] opacity-20 bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 animate-fade-in text-center lg:text-left">
              <div className="space-y-4 sm:space-y-6">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 animate-bounce-in text-xs sm:text-sm"
                >
                  🚗 🏠 መስገበያ - የኢትዮጵያ መድረክ
                </Badge>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight animate-slide-in-left">
                  የህልምዎ መኪና፣ ቤት እና መሬት
                  <span className="block gradient-text-brand text-white">እዚህ ይጠብቅዎታል</span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed animate-slide-in-left animate-stagger-1 max-w-2xl mx-auto lg:mx-0">
                  በሺዎች የሚቆጠሩ ጥራት ያላቸው ተሽከርካሪዎች፣ ፕሪሚየም ንብረቶች እና ዋና የመሬት እድሎችን ያግኙ። በቀጥታ ከአከፋፋዮች እና ወኪሎች ጋር ይገናኙ፣ ስምምነቶችን
                  ይደራደሩ እና በእኛ ብልህ መድረክ ፍጹም ተዛማጅዎን ያግኙ።
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-in-left animate-stagger-3 justify-center lg:justify-start">
                {!user ? (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <Link href="/cars" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3"
                      >
                        ዝርዝሮችን ይመልከቱ
                        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </Link>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-emerald-600 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3"
                    >
                      ግባ
                    </Button>
                  </div>
                ) : (
                  <Link
                    href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3"
                    >
                      ወደ ዳሽቦርድ ይሂዱ
                      <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="relative animate-slide-in-right order-first lg:order-last">
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-lg blur opacity-30 animate-pulse-slow"></div>
              <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] rounded-lg shadow-2xl overflow-hidden">
                {videos.map((video, index) => (
                  <video
                    key={index}
                    src={video.src}
                    alt={video.alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentVideoIndex ? "opacity-100" : "opacity-0"
                    }`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={(e) => {
                      console.log("[v0] Video loading error:", e)
                    }}
                    onLoadedData={() => {
                      console.log("[v0] Video loaded successfully")
                    }}
                  />
                ))}

                {/* Video indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {videos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentVideoIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`View ${videos[index].category} video`}
                    />
                  ))}
                </div>

                {/* Category label */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-black/50 text-white border-white/20 backdrop-blur-sm">
                    {videos[currentVideoIndex].category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-2 sm:mb-4">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-${stat.color} rounded-full flex items-center justify-center shadow-lg transition-transform duration-300`}
                  >
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-gray-900">
              ለምን የእኛን መድረክ ይመርጣሉ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              ለእርስዎ ስኬት የተነደፉ የላቀ ባህሪያት ያላቸውን የመግዛት እና የመሸጥ ወደፊት ይለማመዱ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="pb-2 sm:pb-4">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-${feature.color}/10 border-2 border-${feature.color}/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-${feature.color}`} />
                  </div>
                  <CardTitle className="text-base sm:text-lg md:text-xl text-gray-900 px-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm sm:text-base text-gray-600 px-2">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-gray-900">
              ተመራጭ ዝርዝሮች
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 px-4">
              የእኛን በእጅ የተመረጡ ፕሪሚየም ተሽከርካሪዎች፣ ንብረቶች እና መሬት ይዳስሱ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {featuredListings.map((listing, index) => {
              const getCategoryColor = (category: string) => {
                switch (category) {
                  case "car":
                    return "cars"
                  case "house":
                    return "houses"
                  case "land":
                    return "lands"
                  case "machine":
                    return "machines"
                  default:
                    return "brand-green"
                }
              }
              const categoryColor = getCategoryColor(listing.category)

              return (
                <Card
                  key={listing.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2 bg-white border-0 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-full h-40 sm:h-48 md:h-52 object-cover transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                      <Badge
                        variant={listing.status === "new" ? "default" : "secondary"}
                        className={`shadow-md text-xs ${listing.status === "new" ? `bg-${categoryColor}` : "bg-gray-600"}`}
                      >
                        {listing.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      <h3
                        className={`text-sm sm:text-base md:text-lg font-semibold text-gray-900 group-hover:text-${categoryColor} transition-colors duration-300 line-clamp-2`}
                      >
                        {listing.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className={`text-base sm:text-lg md:text-xl font-bold text-${categoryColor}`}>
                          {(listing.price || 0).toLocaleString()} ብር
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-1">{listing.location}</p>
                      <Link href={listing.href}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 text-xs sm:text-sm py-2">
                          ዝርዝሮችን ይመልከቱ
                          <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-8 sm:mt-12 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3 sm:gap-4">
              <Link href="/cars" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-cars text-cars hover:bg-cars hover:text-white transition-all duration-300 bg-transparent text-sm sm:text-base py-2.5 sm:py-3"
                >
                  <Car className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  ሁሉንም መኪናዎች ይመልከቱ
                </Button>
              </Link>
              <Link href="/houses" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-houses text-houses hover:bg-houses hover:text-white transition-all duration-300 bg-transparent text-sm sm:text-base py-2.5 sm:py-3"
                >
                  <HomeIcon className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  ሁሉንም ንብረቶች ይመልከቱ
                </Button>
              </Link>
              <Link href="/lands" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-lands text-lands hover:bg-lands hover:text-white transition-all duration-300 bg-transparent text-sm sm:text-base py-2.5 sm:py-3"
                >
                  <TreePine className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  ሁሉንም መሬቶች ይመልከቱ
                </Button>
              </Link>
              <Link href="/machines" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-machines text-machines hover:bg-machines hover:text-white transition-all duration-300 bg-transparent text-sm sm:text-base py-2.5 sm:py-3"
                >
                  <Shield className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  ሁሉንም ማሽኖች ይመልከቱ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
