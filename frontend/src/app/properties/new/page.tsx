"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md border flex items-center justify-center text-sm text-gray-500 font-medium">Loading Map...</div>
});

export default function AddPropertyPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "RENT",
    beds: "",
    baths: "",
    city: "",
    area: "",
    lat: 0,
    lng: 0,
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("addPropertyFormData");
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved form data");
      }
    }
  }, []);

  // Save form data on change
  useEffect(() => {
    localStorage.setItem("addPropertyFormData", JSON.stringify(formData));
  }, [formData]);

  if (!isAuthenticated && typeof window !== "undefined") {
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value });
  };

  const handleLocationSelect = (lat: number, lng: number, city?: string, area?: string) => {
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
      ...(city ? { city } : {}),
      ...(area ? { area } : {}),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 5);
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lat === 0 && formData.lng === 0) {
      alert("Please select a location on the map.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      files.forEach((file) => {
        data.append("media", file);
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/properties`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("addPropertyFormData");
      router.push(`/properties/${response.data.id}`);
    } catch (error: any) {
      console.error("Failed to add property", error);
      alert(error.response?.data?.message || "Failed to add property. Check file limits.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mt-8 mb-16">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight">List a Property</CardTitle>
          <CardDescription className="text-base">
            Fill out the details below to publish your property on Rentiq.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
                <Input required id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Luxury 2-Bed Apartment in DHA" className="h-11" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea required id="description" name="description" value={formData.description} onChange={handleChange} className="min-h-[120px] resize-none" placeholder="Describe the key features of your property..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-semibold">Property Type</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RENT">For Rent</SelectItem>
                    <SelectItem value="SALE">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold">Price (PKR)</Label>
                <Input required id="price" type="number" min="0" name="price" value={formData.price} onChange={handleChange} placeholder="50000" className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beds" className="text-sm font-semibold">Bedrooms</Label>
                <Input required id="beds" type="number" min="0" name="beds" value={formData.beds} onChange={handleChange} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baths" className="text-sm font-semibold">Bathrooms</Label>
                <Input required id="baths" type="number" min="0" name="baths" value={formData.baths} onChange={handleChange} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                <Input required id="city" type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Lahore" className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area" className="text-sm font-semibold">Area / Neighborhood</Label>
                <Input id="area" type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. Muslim Town, DHA Phase 5" className="h-11" />
              </div>

              <div className="md:col-span-2 space-y-3">
                <div>
                  <Label className="text-sm font-semibold block mb-1">Location on Map</Label>
                  <p className="text-xs text-muted-foreground">Click on the map where your property is. City and area will be auto-filled.</p>
                </div>
                <div className="rounded-lg overflow-hidden border shadow-sm ring-1 ring-black/5">
                  <LocationPickerMap onLocationSelect={handleLocationSelect} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div>
                  <Label htmlFor="media" className="text-sm font-semibold block mb-1">Media (Images & Video)</Label>
                  <p className="text-xs text-muted-foreground">You can upload up to 4 images (4MB each) and 1 video (7MB).</p>
                </div>
                <Input 
                  id="media"
                  type="file" 
                  multiple 
                  accept="image/jpeg, image/png, video/mp4" 
                  onChange={handleFileChange} 
                  className="h-11 cursor-pointer file:cursor-pointer file:bg-gray-100 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:text-sm file:font-semibold hover:file:bg-gray-200" 
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-6 border-t bg-gray-50/50 rounded-b-xl">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 text-base font-bold shadow-sm"
            >
              {loading && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
              {loading ? "Publishing Listing..." : "Publish Listing"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
