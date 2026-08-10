"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import { Loader2, Tag, MapPin, Building2, Image as ImageIcon, CheckCircle2, Users } from "lucide-react";
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
import { formatPakistaniCurrency } from "@/lib/utils";

import { propertySchema } from "@/lib/schemas";

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
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
    isRoommateAllowed: false,
    roommatesCount: "2",
  });

  const addPriceAmount = (amountToAdd: number) => {
    const current = Number(formData.price) || 0;
    const updated = Math.min(2000000000, current + amountToAdd);
    setFormData((prev) => ({ ...prev, price: updated.toString() }));
    if (formErrors.price) setFormErrors((prev) => ({ ...prev, price: "" }));
  };

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    if (formErrors.city && city) setFormErrors((prev) => ({ ...prev, city: "" }));
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
    
    // Zod client validation check
    const parsedData = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      type: formData.type as "RENT" | "SALE",
      beds: Number(formData.beds),
      baths: Number(formData.baths),
      city: formData.city,
      area: formData.area || undefined,
      isRoommateAllowed: formData.isRoommateAllowed,
      roommatesCount: Number(formData.roommatesCount),
      lat: formData.lat,
      lng: formData.lng,
    };

    const validation = propertySchema.safeParse(parsedData);
    if (!validation.success) {
      const errorsObj: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errorsObj[issue.path[0].toString()] = issue.message;
        }
      });
      setFormErrors(errorsObj);
      const firstErrorMsg = validation.error.issues[0]?.message || "Please fix form validation errors";
      toast.error(firstErrorMsg);
      return;
    }

    if (!formData.lat || !formData.lng) {
      toast.error("Please click on the map to set property location.");
      return;
    }

    setFormErrors({});
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
      data.append("isRoommateAllowed", formData.isRoommateAllowed.toString());
      data.append("roommatesCount", formData.roommatesCount);

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
      const msg = error.response?.data?.message || "Failed to add property. Check file limits.";
      toast.error(typeof msg === "string" ? msg : "Failed to add property.");
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
                  maxLength={100}
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g. Executive 2-Bed Furnished Apartment in DHA Phase 5" 
                  className={`h-11 rounded-xl font-medium transition-colors ${
                    formErrors.title ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20" : "border-slate-200"
                  }`} 
                />
                {formErrors.title && (
                  <p className="text-xs font-bold text-rose-600 animate-in fade-in-50">⚠️ {formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</Label>
                <Textarea 
                  required 
                  id="description" 
                  name="description" 
                  maxLength={2000}
                  value={formData.description} 
                  onChange={handleChange} 
                  className={`min-h-[120px] rounded-xl font-medium resize-none transition-colors ${
                    formErrors.description ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20" : "border-slate-200"
                  }`}
                  placeholder="Describe key features, floor plan, amenities, and nearby landmarks..." 
                />
                {formErrors.description && (
                  <p className="text-xs font-bold text-rose-600 animate-in fade-in-50">⚠️ {formErrors.description}</p>
                )}
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
                  <Input required id="beds" type="number" min="0" max="30" name="beds" value={formData.beds} onChange={handleChange} className="h-11 rounded-xl border-slate-200 font-medium" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baths" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bathrooms</Label>
                  <Input required id="baths" type="number" min="0" max="30" name="baths" value={formData.baths} onChange={handleChange} className="h-11 rounded-xl border-slate-200 font-medium" />
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
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="space-y-2 max-w-lg">
                <Label htmlFor="price" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price (PKR)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    PKR
                  </span>
                  <Input 
                    required 
                    id="price" 
                    type="number" 
                    min="1000" 
                    max="2000000000"
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="e.g. 25000000" 
                    className="h-11 pl-16 rounded-xl border-slate-200 font-bold text-base text-slate-900" 
                  />
                </div>

                {/* Live Pakistani Currency Preview Badge */}
                {formData.price && !isNaN(Number(formData.price)) && Number(formData.price) > 0 && (
                  <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200/80 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-2 flex-wrap animate-in fade-in-50 duration-200">
                    <span className="flex items-center gap-1.5">
                      💡 Live Format: <strong className="text-emerald-700 text-sm font-black">{formatPakistaniCurrency(Number(formData.price))}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      (PKR {Number(formData.price).toLocaleString()})
                    </span>
                  </div>
                )}

                {/* Quick 1-Click Price Adder Buttons */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Add Amounts:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => addPriceAmount(100000)} className="h-8 text-xs font-bold rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      + 1 Lac
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addPriceAmount(500000)} className="h-8 text-xs font-bold rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      + 5 Lac
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addPriceAmount(5000000)} className="h-8 text-xs font-bold rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      + 50 Lac
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addPriceAmount(10000000)} className="h-8 text-xs font-bold rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      + 1 Crore
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setFormData((prev) => ({ ...prev, price: "" }))} className="h-8 text-xs font-bold rounded-lg text-slate-400 hover:text-red-600">
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2.5: Roommate & Rent-Split Mode (Only for RENT) */}
          {formData.type === "RENT" && (
            <Card className="rounded-3xl border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-green-50/30 shadow-xs">
              <CardHeader className="border-b border-emerald-100/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
                    <Users size={22} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      Rent Sharing / Roommates Welcome 🤝
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600">
                      Attract students & young professionals by offering per-person rent split calculations.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-emerald-100 shadow-xs">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Allow Roommates / Rent Sharing?</p>
                    <p className="text-xs text-slate-500 mt-0.5">Displays a green "Roommates Welcome" badge and per-person pricing on feed.</p>
                  </div>
                  <input
                    type="checkbox"
                    id="isRoommateAllowed"
                    checked={formData.isRoommateAllowed}
                    onChange={(e) => setFormData({ ...formData, isRoommateAllowed: e.target.checked })}
                    className="h-6 w-6 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                </div>

                {formData.isRoommateAllowed && (
                  <div className="space-y-3 pt-2">
                    <Label htmlFor="roommatesCount" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Split Rent N Ways (Max Roommates)
                    </Label>
                    <Select
                      value={formData.roommatesCount}
                      onValueChange={(val) => {
                        if (val) setFormData((prev) => ({ ...prev, roommatesCount: val }));
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-emerald-200 font-medium bg-white max-w-xs focus:ring-emerald-500">
                        <SelectValue placeholder="Select split count" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="2">Split 2 Ways (2 Roommates)</SelectItem>
                        <SelectItem value="3">Split 3 Ways (3 Roommates)</SelectItem>
                        <SelectItem value="4">Split 4 Ways (4 Roommates)</SelectItem>
                        <SelectItem value="5">Split 5 Ways (5 Roommates)</SelectItem>
                        <SelectItem value="6">Split 6 Ways (6 Roommates)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {formData.price && (
                      <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                        <span>💡 Each roommate will see:</span>
                        <strong className="text-emerald-700 font-bold text-sm">
                          PKR {Math.round(Number(formData.price) / Number(formData.roommatesCount)).toLocaleString()} / person
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
