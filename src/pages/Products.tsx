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

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (filters?: any) => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts({
        status: 'active',
        search: searchQuery,
        category: selectedCategory,
        ...filters
      });
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive'
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchProducts({ category: category || undefined });
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return "https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxpbmR1c3RyaWFsJTIwbWFjaGluZXJ5fGVufDB8fHx8MTc1NTY4MTQ3NXww&ixlib=rb-4.1.0&q=85";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-2 w-full md:max-w-md">
              <Input
                type="text"
                placeholder="Search for machinery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Products
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${products.length} products available`}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or check back later for new products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  {product.supplier.isVerified && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="text-xs">
                        Verified
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2 text-base">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    by {product.supplier.companyName || product.supplier.name}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{product.priceRange || 'Contact for price'}</span>
                    </div>
                    
                    {product.minOrderQuantity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MOQ:</span>
                        <span>{product.minOrderQuantity} units</span>
                      </div>
                    )}
                    
                    {product.countryOfOrigin && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Origin:</span>
                        <span>{product.countryOfOrigin}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views:</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {product.views}
                      </span>
                    </div>
                  </div>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="pt-2 flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/product/${product._id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/supplier/${product.supplier._id}`}>
                        Supplier
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
