"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import { Loader2, Tag, MapPin, Building2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Dynamically import Map with SSR disabled
const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-72 w-full rounded-2xl" /> 
  }
);

export default function NewPropertyPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  
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

  const handleTypeChange = (value: string | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, type: value }));
    }
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
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 5) {
        toast.error("You can only select up to 5 media files total");
        return;
      }
      setMediaFiles(filesArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lat || !formData.lng) {
      toast.error("Please click on the map to set property location.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("type", formData.type);
      data.append("beds", formData.beds);
      data.append("baths", formData.baths);
      data.append("city", formData.city);
      if (formData.area) data.append("area", formData.area);
      data.append("lat", formData.lat.toString());
      data.append("lng", formData.lng.toString());

      mediaFiles.forEach((file) => {
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
      toast.success("Property listing posted successfully!");
      router.push(`/properties/${response.data.id}`);
    } catch (error: any) {
      console.error("Failed to add property", error);
      toast.error(error.response?.data?.message || "Failed to add property. Check file limits.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Post a Property Listing
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Reach thousands of buyers and tenants across Pakistan on Rentiq.
            </p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3 py-1 rounded-full text-xs shrink-0">
            Zameen Profolio Standards
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Property Details */}
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <Building2 size={22} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Property Details</CardTitle>
                  <CardDescription className="text-xs">Basic information about your property listing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Title</Label>
                <Input 
                  required 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g. Executive 2-Bed Furnished Apartment in DHA Phase 5" 
                  className="h-11 rounded-xl border-slate-200 font-medium" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</Label>
                <Textarea 
                  required 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="min-h-[120px] rounded-xl border-slate-200 font-medium resize-none" 
                  placeholder="Describe key features, floor plan, amenities, and nearby landmarks..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Purpose / Type</Label>
                  <Select value={formData.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 font-medium bg-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="RENT">For Rent</SelectItem>
                      <SelectItem value="SALE">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beds" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bedrooms</Label>
                  <Input required id="beds" type="number" min="0" name="beds" value={formData.beds} onChange={handleChange} className="h-11 rounded-xl border-slate-200 font-medium" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baths" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bathrooms</Label>
                  <Input required id="baths" type="number" min="0" name="baths" value={formData.baths} onChange={handleChange} className="h-11 rounded-xl border-slate-200 font-medium" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Price & Area */}
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <Tag size={22} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Price & Value</CardTitle>
                  <CardDescription className="text-xs">Set your asking price in Pakistani Rupees (PKR)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="space-y-2 max-w-md">
                <Label htmlFor="price" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price (PKR)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    PKR
                  </span>
                  <Input 
                    required 
                    id="price" 
                    type="number" 
                    min="0" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="e.g. 75000" 
                    className="h-11 pl-16 rounded-xl border-slate-200 font-bold text-base text-slate-900" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Location (Landscape Map) */}
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <MapPin size={22} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Property Location</CardTitle>
                  <CardDescription className="text-xs">Select location on the landscape map below to auto-fill address details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-bold text-slate-700 uppercase tracking-wider">City</Label>
                  <Input required id="city" type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Lahore" className="h-11 rounded-xl border-slate-200 font-medium" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Area / Locality</Label>
                  <Input id="area" type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. DHA Phase 6, Muslim Town" className="h-11 rounded-xl border-slate-200 font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Set Pin on Landscape Map</Label>
                <LocationPickerMap onLocationSelect={handleLocationSelect} />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Media Upload */}
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Property Media</CardTitle>
                  <CardDescription className="text-xs">Upload up to 4 high quality photos and 1 video walkthrough</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <Input 
                id="media"
                type="file" 
                multiple 
                accept="image/jpeg, image/png, video/mp4" 
                onChange={handleFileChange} 
                className="h-12 cursor-pointer rounded-xl border-slate-200 file:cursor-pointer file:bg-emerald-50 file:text-emerald-700 file:border-0 file:rounded-lg file:px-4 file:py-1.5 file:mr-4 file:text-xs file:font-bold hover:file:bg-emerald-100" 
              />
              {mediaFiles.length > 0 && (
                <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={14} /> {mediaFiles.length} file(s) selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit Action Button */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full md:w-auto h-13 px-10 text-base font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
              {loading ? "Publishing Listing..." : "Post Property Listing"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
