"use client"

import Link from "next/link"
import { ArrowRight, Car, HomeIcon, MessageCircle, Star, Users, TrendingUp, Shield, TreePine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/app-context"
import { useState, useEffect } from "react"

export function Home() {
  const { user, setIsAuthModalOpen, cars, houses, lands, machines, deals,users } = useApp()

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const videos = [
    {
      src: "https://res.cloudinary.com/dsu9nxhpc/video/upload/car_qv0tej.mp4",
      alt: "Modern luxury car showcase",
      category: "cars",
    },
    {
      src: "https://res.cloudinary.com/dsu9nxhpc/video/upload/house_fxe3y4.mp4",
      alt: "Modern architectural design showcase",
      category: "houses",
    },
    {
      src: "https://res.cloudinary.com/dsu9nxhpc/video/upload/land_rmdl3e.mp4",
      alt: "Beautiful landscapes and real estate plots",
      category: "lands",
    },
    {
      src: "https://res.cloudinary.com/dsu9nxhpc/video/upload/machine_d13rjy.mp4",
      alt: "Construction machines and industrial equipment",
      category: "machines",
    },
  ]

  // Calculate stats from actual data - use reasonable estimates for public stats
  const totalListings = (cars?.length || 0) + (houses?.length || 0) + (lands?.length || 0) + (machines?.length || 0)
  
  // For public home page, use a reasonable default since users aren't provided by context
  const ActiveUsers =
  users && users.length > 0
    ? users.filter(u => u.status?.toLowerCase() === "active").length
    : 7

  const completedDeals = deals?.filter(deal => deal.status === "completed" || deal.status === "accepted").length || 850

  // Dynamic stats based on actual data where available, estimates for private data
  const stats = [
    { 
      label: "ንቁ ዝርዝሮች", 
      value: `${totalListings}+`, 
      icon: Car, 
      color: "brand-green" 
    },
    { 
      label: "ደስተኛ ደንበኞች", 
      value: `${ActiveUsers.toLocaleString()}+`, 
      icon: Users, 
      color: "brand-red" 
    },
    { 
      label: "የተሳካ ስምምነቶች", 
      value: `${completedDeals}+`, 
      icon: TrendingUp, 
      color: "brand-yellow" 
    },
    { 
      label: "አማካይ ደረጃ", 
      value: "4.9/5", 
      icon: Star, 
      color: "brand-green" 
    },
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

  // Filter to show only approved items (or all items if approved field doesn't exist for backward compatibility)
  // Always display exactly 4 items: one from each category (car, house, land, machine)
  // Prioritize featured items, otherwise take the top approved item
  
  const getTopItem = (items: any[], category: string) => {
    if (!items || items.length === 0) return null;
    
    // First try to find a featured and approved item
    const featuredItem = items.find((item) => item.featured && (item.approved !== false));
    if (featuredItem) {
      return featuredItem;
    }
    
    // If no featured item, take the first approved item
    const approvedItem = items.find((item) => item.approved !== false);
    if (approvedItem) {
      return approvedItem;
    }
    
    // If no approved item, take the first item (for backward compatibility)
    return items[0];
  };

  const topCar = getTopItem(cars || [], 'car');
  const topHouse = getTopItem(houses || [], 'house');
  const topLand = getTopItem(lands || [], 'land');
  const topMachine = getTopItem(machines || [], 'machine');

  const featuredListings = [
    topCar && {
      id: `car-${topCar.id || topCar._id}`,
      title: topCar.title,
      price: topCar.price || 0,
      image: topCar.images?.[0] || "/placeholder.svg",
      status: topCar.condition === "used" ? "used" : "new",
      location: topCar.location || "",
      category: "car",
      href: `/cars/${topCar.id || topCar._id}`,
      applicationCount: deals?.filter(
        (deal) => deal.itemId === (topCar.id || topCar._id) || deal.item?._id === (topCar.id || topCar._id) || deal.item?.id === (topCar.id || topCar._id)
      ).length || 0,
    },
    topHouse && {
      id: `house-${topHouse.id || topHouse._id}`,
      title: topHouse.title,
      price: topHouse.price || 0,
      image: topHouse.images?.[0] || "/placeholder.svg",
      status: topHouse.status,
      location: topHouse.location || "",
      category: "house",
      href: `/houses/${topHouse.id || topHouse._id}`,
      applicationCount: deals?.filter(
        (deal) => deal.itemId === (topHouse.id || topHouse._id) || deal.item?._id === (topHouse.id || topHouse._id) || deal.item?.id === (topHouse.id || topHouse._id)
      ).length || 0,
    },
    topLand && {
      id: `land-${topLand.id || topLand._id}`,
      title: topLand.title,
      price: topLand.price || 0,
      image: topLand.images?.[0] || "/placeholder.svg",
      status: topLand.status,
      location: topLand.location || "",
      category: "land",
      href: `/lands/${topLand.id || topLand._id}`,
      applicationCount: deals?.filter(
        (deal) => deal.itemId === (topLand.id || topLand._id) || deal.item?._id === (topLand.id || topLand._id) || deal.item?.id === (topLand.id || topLand._id)
      ).length || 0,
    },
    topMachine && {
      id: `machine-${topMachine.id || topMachine._id}`,
      title: topMachine.title,
      price: topMachine.price || 0,
      image: topMachine.images?.[0] || "/placeholder.svg",
      status: topMachine.condition,
      location: topMachine.location || "",
      category: "machine",
      href: `/machines/${topMachine.id || topMachine._id}`,
      applicationCount: deals?.filter(
        (deal) => deal.itemId === (topMachine.id || topMachine._id) || deal.item?._id === (topMachine.id || topMachine._id) || deal.item?.id === (topMachine.id || topMachine._id)
      ).length || 0,
    },
  ].filter(Boolean) // Remove any null/undefined entries

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [videos.length])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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
                  🚗 🏠 ማስገበያ - የመገበያያ መድረክ
                </Badge>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight animate-slide-in-left">
                  የህልምዎ መኪና፣ ቤት እና መሬት
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight animate-slide-in-left">እዚህ ይጠብቅዎታል</span>
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
                      className="w-full sm:w-auto text-white hover:bg-white  bg-blue-400 hover:text-emerald-600 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3"
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
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentVideoIndex ? "opacity-100" : "opacity-0"
                    }`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={(e) => {
                      console.log(" Video loading error:", e)
                    }}
                    onLoadedData={() => {
                      console.log(" Video loaded successfully")
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
          
          {/* Category Navigation - Small Size at Bottom of Hero */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-2">
                የምርት ምድቦች
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <Link href="/lands" className="group">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=400&fit=crop"
                    alt="Lands"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h4 className="text-white font-semibold text-xs sm:text-sm md:text-base">Lands</h4>
                  </div>
                </div>
              </Link>

              <Link href="/houses" className="group">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=400&fit=crop"
                    alt="House"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h4 className="text-white font-semibold text-xs sm:text-sm md:text-base">House</h4>
                  </div>
                </div>
              </Link>

              <Link href="/machines" className="group">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop"
                    alt="Machines"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h4 className="text-white font-semibold text-xs sm:text-sm md:text-base">Machines</h4>
                  </div>
                </div>
              </Link>

              <Link href="/cars" className="group">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop"
                    alt="Vehicle"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h4 className="text-white font-semibold text-xs sm:text-sm md:text-base">Vehicle</h4>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Featured Listings Section */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
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
                      {listing.applicationCount > 0 && (
                        <div className="flex items-center text-xs text-blue-600">
                          <Users className="w-3 h-3 mr-1" />
                          {listing.applicationCount} {listing.applicationCount === 1 ? "application" : "applications"}
                        </div>
                      )}
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