# Feature Walkthrough: Mark as Sold/Rented

We have successfully implemented the feature allowing property owners to update the status of their properties once a deal is finalized.

## What was built

### 1. Database & Backend Support
*   Added a `status` field to the `Property` model in the database (`AVAILABLE`, `SOLD`, or `RENTED`).
*   Created a secure backend endpoint (`PATCH /properties/:id/status`) that only allows the *actual owner* of the property to change its status.

### 2. Owner Dashboard Management
*   On the **Dashboard** page, property owners now see a new button on each of their listings.
*   For rentals, they can click **"Mark Rented"**. For sales, they can click **"Mark Sold"**.
*   Clicking this instantly updates the status and displays a visual badge next to the property title in the dashboard.
*   They can also click **"Mark Available"** to revert the status if a deal falls through.

### 3. Public Feed Updates
*   Properties that are marked as SOLD or RENTED now appear slightly dimmed on the main **Feed** to visually indicate they are no longer on the market.
*   A prominent red **SOLD** or **RENTED** badge is displayed directly on the property image.

### 4. Property Detail Page Updates
*   When a user clicks into a sold/rented property, they see the red status badge.
*   **Crucially:** The "Message Owner" button is now **hidden** for unavailable properties. Instead, users see a message: *"This property is no longer available. It has been marked as sold/rented by the owner."* This prevents owners from getting spammed about properties that are already gone.

## Verification
*   **Tested Database:** The migration was applied successfully without errors.
*   **Tested Dashboard:** The toggle logic dynamically checks if the property is a "SALE" or "RENT" and shows the correct text.
*   **Tested Feed & Detail:** The UI updates elegantly to reflect the new `status` property returned from the backend.
