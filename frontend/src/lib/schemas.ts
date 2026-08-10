import { z } from "zod";

// Pakistani CNIC regex: 5 digits - 7 digits - 1 digit (e.g., 35201-1234567-1)
export const PAKISTANI_CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;

export const tenantVerificationSchema = z.object({
  cnicNumber: z
    .string()
    .min(1, "CNIC number is required")
    .regex(
      PAKISTANI_CNIC_REGEX,
      "Invalid Pakistani CNIC format. Standard format: XXXXX-XXXXXXX-X (e.g. 35201-1234567-1)"
    ),
});

export const propertySchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(15, "Description must be at least 15 characters")
    .max(2000, "Description cannot exceed 2,000 characters"),
  price: z
    .number({ message: "Price must be a valid number" })
    .min(1000, "Price must be at least PKR 1,000")
    .max(2000000000, "Price cannot exceed PKR 2 Billion (200 Crore)"),
  type: z.enum(["RENT", "SALE"]),
  beds: z
    .number({ message: "Beds must be a valid number" })
    .int("Bedrooms must be a whole number")
    .min(0, "Bedrooms cannot be negative")
    .max(30, "Maximum 30 bedrooms allowed"),
  baths: z
    .number({ message: "Baths must be a valid number" })
    .int("Bathrooms must be a whole number")
    .min(0, "Bathrooms cannot be negative")
    .max(30, "Maximum 30 bathrooms allowed"),
  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(60, "City name cannot exceed 60 characters"),
  area: z.string().optional(),
  isRoommateAllowed: z.boolean().optional(),
  roommatesCount: z.number().min(1).max(10).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type TenantVerificationInput = z.infer<typeof tenantVerificationSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
