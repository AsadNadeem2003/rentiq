"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import { Loader2, Tag, Building2, Users, ArrowLeft, Save, Image as ImageIcon, Trash2, CheckCircle2, Plus } from "lucide-react";
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

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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

  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`);
        const p = response.data;
        setFormData({
          title: p.title || "",
          description: p.description || "",
          price: p.price ? p.price.toString() : "",
          type: p.type || "RENT",
          beds: p.beds ? p.beds.toString() : "",
          baths: p.baths ? p.baths.toString() : "",
          city: p.city || "",
          area: p.area || "",
          lat: p.lat || 0,
          lng: p.lng || 0,
          isRoommateAllowed: p.isRoommateAllowed || false,
          roommatesCount: p.roommatesCount ? p.roommatesCount.toString() : "2",
        });
        setExistingMediaUrls(p.mediaUrls || []);
      } catch (error) {
        console.error("Failed to fetch property details for editing", error);
        toast.error("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

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
      const selected = Array.from(e.target.files);
      setNewMediaFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleRemoveExistingMedia = (index: number) => {
    setExistingMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewMedia = (index: number) => {
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
      data.append("mediaUrls", JSON.stringify(existingMediaUrls));

      newMediaFiles.forEach((file) => {
        data.append("media", file);
      });

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Property updated successfully!");
      router.push(`/properties/${id}`);
    } catch (error: any) {
      console.error("Failed to update property", error);
      toast.error(error.response?.data?.message || "Failed to update property.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-slate-500 mb-2 p-0 h-auto hover:bg-transparent hover:text-slate-800 flex items-center gap-1"
              onClick={() => router.back()}
            >
              <ArrowLeft size={14} /> Back to Property Details
            </Button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Edit Property Listing
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Update details, price, location, photos, or roommate settings for your property.
            </p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3 py-1 rounded-full text-xs shrink-0">
            Owner Mode 🛠️
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

          {/* Section 2: Price & Value */}
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <Tag size={22} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Price & Value</CardTitle>
                  <CardDescription className="text-xs">Update your asking price in Pakistani Rupees (PKR)</CardDescription>
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
                    className="h-11 pl-16 rounded-xl border-slate-200 font-bold text-base text-slate-900" 
                  />
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

          {/* Section 3: Media Upload & Photos */}
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Property Photos & Video</CardTitle>
                  <CardDescription className="text-xs">Manage current photos or upload new images & video walkthrough</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Existing photos preview grid */}
              {existingMediaUrls.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Current Photos ({existingMediaUrls.length})</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {existingMediaUrls.map((url, idx) => (
                      <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 h-32 bg-slate-100 flex items-center justify-center p-1">
                        <img src={url} alt={`Photo ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingMedia(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly selected files preview */}
              {newMediaFiles.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <Label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={14} /> Newly Selected Files ({newMediaFiles.length})
                  </Label>
                  <div className="space-y-2">
                    {newMediaFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-900">
                        <span className="truncate max-w-xs">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewMedia(idx)}
                          className="text-red-600 hover:text-red-800 font-bold ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload input button */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="media" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add New Photos / Video</Label>
                <Input 
                  id="media"
                  type="file" 
                  multiple 
                  accept="image/jpeg, image/png, video/mp4" 
                  onChange={handleFileChange} 
                  className="h-12 cursor-pointer rounded-xl border-slate-200 file:cursor-pointer file:bg-emerald-50 file:text-emerald-700 file:border-0 file:rounded-lg file:px-4 file:py-1.5 file:mr-4 file:text-xs file:font-bold hover:file:bg-emerald-100" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Location (Landscape Map) */}
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <Building2 size={22} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">City & Area Name</CardTitle>
                  <CardDescription className="text-xs">Specify exact city and neighborhood so buyers know your location</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-bold text-slate-700 uppercase tracking-wider">City Name</Label>
                  <Input 
                    required 
                    id="city" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    placeholder="e.g. Lahore, Karachi, Islamabad" 
                    className="h-11 rounded-xl border-slate-200 font-medium" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Specific Area / Neighborhood</Label>
                  <Input 
                    id="area" 
                    name="area" 
                    value={formData.area} 
                    onChange={handleChange} 
                    placeholder="e.g. DHA Phase 5, Gulberg III, Muslim Town" 
                    className="h-11 rounded-xl border-slate-200 font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Update Location Pin on Map</Label>
                <LocationPickerMap onLocationSelect={handleLocationSelect} />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-12 px-6 rounded-2xl font-bold border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-8 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
              {saving ? "Saving Changes & Uploading..." : "Save Property Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
