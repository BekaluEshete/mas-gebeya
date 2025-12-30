"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

interface Deal {
  _id: string;
  buyer: { fullName: string };
  seller: { fullName: string };
  item: { title: string; category: string; price: number };
  status: string;
  createdAt: string;
}

export function RecentTransactionsCarousel() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentDeals() {
      try {
        const response = await fetch(`${API_BASE_URL}/deals/recent`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();

        // Check if responseData has a 'data' field and if 'data.deals' is an array
        if (responseData && responseData.data && Array.isArray(responseData.data.deals)) {
          setDeals(responseData.data.deals.slice(0, 5)); // Limit to 5 deals
        } else {
          console.error("API returned unexpected data structure or empty deals array:", responseData);
          setDeals([]); // Set to empty array if data structure is unexpected or deals is not an array
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecentDeals();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading recent transactions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (deals.length === 0) {
    return null; // Don't render section if no deals
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-gray-900">
            የቅርብ ጊዜ ግብይቶች
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 px-4">
            በእኛ መድረክ ላይ የተጠናቀቁ የቅርብ ጊዜ ስምምነቶችን ይመልከቱ
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marquee space-x-4 pause-on-hover">
            {/* Duplicate deals for seamless loop */}
            {[...deals, ...deals].map((deal, index) => (
              <Card key={`${deal._id}-${index}`} className="min-w-[300px] md:min-w-[350px] bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl text-gray-900">
                    {deal.item?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-[#0046FF]">{deal.buyer?.fullName || "Unknown buyer"}</span> bought{" "}
                    <span className="font-semibold text-[#0046FF]">{deal.item?.category || "an item"}</span> from{" "}
                    <span className="font-semibold text-[#0046FF]">{deal.seller?.fullName || "Unknown seller"}</span> for{" "}
                    <span className="font-bold text-green-600">{(deal.item?.price || 0).toLocaleString()} ብር</span> on{" "}
                    {new Date(deal.createdAt).toLocaleDateString()}.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Link href="/all-transactions">
            <Button size="lg" className="bg-[#0046FF] hover:bg-[#0038CC] text-white transition-all duration-300">
              ሁሉንም ግብይቶች ይመልከቱ
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
