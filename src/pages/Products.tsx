// app/page.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Package, Eye } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  priceRange: string;
  minOrderQuantity?: number;
  countryOfOrigin?: string;
  tags: string[];
  images: string[];
  status: string;
  views: number;
  supplier: {
    _id: string;
    name: string;
    companyName?: string;
    isVerified: boolean;
  };
  createdAt: string;
}

export default function Home() {
  return (
    <div>
    <Header />
    <main className="p-8 px-32 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search for machinery..."
          className="px-4 py-2 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="ml-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
          Filters
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">Products ({products.length})</h2>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow rounded-2xl overflow-hidden transition hover:shadow-xl"
          >
            <div className="relative h-56 w-full">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                {product.category}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.title}</h3>
              <p className="text-gray-500 text-sm mb-2">
                High precision CNC machine for manufacturing
              </p>

              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 font-bold text-lg">
                  {product.price}
                </span>
                <span className="bg-black text-white text-xs px-2 py-1 rounded">
                  {product.stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <p className="text-gray-500 text-sm">MOQ: {product.moq}</p>
              <p className="text-gray-500 text-sm mb-3">
                Lead Time: {product.leadTime}
              </p>

              <div className="flex gap-2">
                <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
                  View Details
                </button>
                <button className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
                  Inquire
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
    {/* <Footer /> */}
  </div>
  );
}
