"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>
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
    lat: 0,
    lng: 0,
  });

  // Redirect if not logged in
  if (!isAuthenticated && typeof window !== "undefined") {
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // The backend pipe limits to 5 files total (4 img, 1 vid) and handles validation,
      // but we should enforce a UI limit too to be safe.
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
        data.append("media", file); // Must match FilesInterceptor('media')
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

      router.push(`/properties/${response.data.id}`);
    } catch (error: any) {
      console.error("Failed to add property", error);
      alert(error.response?.data?.message || "Failed to add property. Check file limits.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 mb-16 bg-white rounded-xl shadow-lg border">
      <h1 className="text-3xl font-bold mb-6">List a Property</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="Luxury 2-Bed Apartment in DHA" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full border rounded-md px-3 py-2 h-32" placeholder="Describe the property..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
              <option value="RENT">For Rent</option>
              <option value="SALE">For Sale</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (PKR)</label>
            <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="50000" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input required type="number" min="0" name="beds" value={formData.beds} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <input required type="number" min="0" name="baths" value={formData.baths} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">City</label>
            <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="Lahore" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Location on Map</label>
            <p className="text-xs text-gray-500 mb-2">Click on the map to place a pin.</p>
            <LocationPickerMap onLocationSelect={handleLocationSelect} />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Media (Images & Video)</label>
            <p className="text-xs text-gray-500 mb-2">Max 4 images (2MB each) and 1 video (5MB).</p>
            <input 
              type="file" 
              multiple 
              accept="image/jpeg, image/png, video/mp4" 
              onChange={handleFileChange} 
              className="w-full border rounded-md px-3 py-2" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          {loading ? "Uploading & Saving..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
