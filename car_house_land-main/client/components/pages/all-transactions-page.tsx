"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Deal {
  _id: string;
  buyer: { fullName: string };
  seller: { fullName: string };
  item: { title: string; category: string; price: number };
  status: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 9; // Number of transactions per page

export function AllTransactionsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchAllDeals() {
      try {
        const response = await fetch("https://car-house-land.onrender.com/api/deals");

        let responseData;
        if (response.ok) {
          responseData = await response.json();
        } else {
          console.warn(`Fetch deals failed with status: ${response.status}`);
          // Attempt to parse anyway in case it returns data with error status (unlikely but possible), or just set empty.
          // However, if the API is strictly 401, we want to avoid showing "Error: HTTP error".
          // We'll set empty or mock if needed, but for now let's just handle it.
          try {
            responseData = await response.json();
          } catch (e) {
            responseData = null;
          }
        }

        // Check if responseData has a 'data' field and if 'data.deals' is an array
        if (responseData && responseData.data && Array.isArray(responseData.data.deals)) {
          setDeals(responseData.data.deals);
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
    fetchAllDeals();
  }, []);

  const totalPages = Math.ceil(deals.length / ITEMS_PER_PAGE);
  const currentDeals = deals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (deals.length === 0) {
    return <div className="text-center py-8 text-gray-600">No transactions found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">All Transactions</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentDeals.map((deal) => (
            <Card key={deal._id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">{deal.item?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-[#0046FF]">{deal.buyer?.fullName || "Unknown buyer"}</span> bought{" "}
                  <span className="font-semibold text-[#0046FF]">{deal.item?.category || "an item"}</span> from{" "}
                  <span className="font-semibold text-[#0046FF]">{deal.seller?.fullName || "Unknown seller"}</span> for{" "}
                  <span className="font-bold text-green-600">{(deal.item?.price || 0).toLocaleString()} ብር</span> on{" "}
                  {new Date(deal.createdAt).toLocaleDateString()}.
                </p>
                <p className="text-sm text-gray-500">Status: <span className="font-medium capitalize">{deal.status}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center space-x-4 mt-12">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
