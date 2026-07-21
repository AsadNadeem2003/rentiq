# Add "Sold Out" Status Feature

Currently, all properties are assumed to be available. We will add a feature allowing the owner to mark a property as "Sold" or "Rented" once a deal is finalized.

## How we will do it

1.  **Database Update:** We will add a `status` field to the `Property` model in our database. By default, it will be `AVAILABLE`. It can be changed to `SOLD` (for sales) or `RENTED` (for rentals).
2.  **Backend API:** We will create a new API endpoint (`PATCH /properties/:id/status`) that allows the property owner to update the status.
3.  **Frontend Dashboard:** We will add a "Mark as Sold" or "Mark as Rented" button on the **Dashboard** page, where the owner manages their own listings.
4.  **Frontend Display:** 
    *   On the **Feed** page, properties marked as sold/rented will have a prominent "SOLD" or "RENTED" badge and will be slightly dimmed so users know it's no longer available.
    *   On the **Property Detail** page, the "Message Owner" button will be disabled or hidden, and a "SOLD/RENTED" banner will be shown.

## User Review Required

> [!IMPORTANT]
> **Design Decision on Feed:** Should we hide "Sold/Rented" properties from the main feed entirely, or keep them visible but dimmed with a "SOLD" badge? (My recommendation is to keep them visible but dimmed, as it shows activity on the platform, but we can also filter them out by default). For this plan, I will keep them visible with a badge.

## Proposed Changes

### Database

#### [MODIFY] [schema.prisma](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/backend/prisma/schema.prisma)
*   Add `status String @default("AVAILABLE")` to the `Property` model.

### Backend

#### [MODIFY] [property.dto.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/backend/src/properties/dto/property.dto.ts)
*   Add a new DTO `UpdatePropertyStatusDto` to validate the status (`AVAILABLE`, `SOLD`, `RENTED`).

#### [MODIFY] [properties.controller.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/backend/src/properties/properties.controller.ts) & [properties.service.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/backend/src/properties/properties.service.ts)
*   Add a `PATCH /:id/status` endpoint to securely update the property status, ensuring only the owner can do it.

### Frontend

#### [MODIFY] [dashboard/page.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/frontend/src/app/dashboard/page.tsx)
*   Add a toggle button on each property card in the dashboard allowing the owner to mark it as Sold/Rented or Available.

#### [MODIFY] [feed/page.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/frontend/src/app/feed/page.tsx)
*   Update property cards to show a "SOLD" or "RENTED" badge if the status is not `AVAILABLE`.

#### [MODIFY] [properties/[id]/page.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/frontend/src/app/properties/[id]/page.tsx)
*   Show the status badge.
*   Hide/disable the "Message Owner" button if the property is no longer available.

## Verification Plan

### Manual Verification
1.  Go to Dashboard as an owner and mark a property as "Sold".
2.  Verify the backend updates the database successfully.
3.  Go to the Feed and verify the "SOLD" badge appears.
4.  Go to the property detail page and verify the "Message Owner" button is hidden.
5.  After everything is verified to be working perfectly, I will create a new git branch, commit the changes, and push them to GitHub.
