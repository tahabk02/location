# Plan: Advanced ERP/CRM Upgrade for Car Rental

This plan outlines the implementation of several professional-grade modules to transform the current application into a high-value ERP/CRM for car rental agencies.

## Objective
To add specialized features (Contracts, Inspection, Multi-agency, OCR, Payments) that increase the commercial value and operational efficiency of the platform.

## Proposed Modules

### 1. Multi-Agency & SuperAdmin Suite
*   **Infrastructure**: Update the backend to strictly isolate data per `agencyId`.
*   **SuperAdmin Dashboard**: A global view for the platform owner to manage all agencies, view global analytics, and manage agency subscriptions.
*   **Agency Profile**: Customizable agency settings (Logo, address, specialized terms & conditions).

### 2. Digital Contracts & Electronic Signatures
*   **Dynamic Generation**: Automatic generation of rental contracts based on booking data.
*   **Signature Pad**: A touch-enabled signature component for clients to sign directly on tablets or mobile phones.
*   **Legal Archiving**: Store signed contracts as base64/blobs in MongoDB or linked to the booking.

### 3. Interactive "État des Lieux" (Inspection)
*   **Visual Damage Map**: A car silhouette (Top, Side, Front, Back) where staff can tap to mark scratches, dents, or glass damage.
*   **Photo Evidence**: Ability to upload and link photos to specific damage markers.
*   **History**: Track car condition over time across different rentals.

### 4. OCR Document Extraction (Structure)
*   **Identity Scanning**: A UI flow to upload CIN/Permis and extract names/numbers.
*   **Validation**: Real-time check for license expiry dates.

### 5. Financial Suite: Payments & Caution
*   **Payment Tracking**: Track "Paid", "Pending", and "Partial" statuses for each booking.
*   **Caution Management**: Specific tracking for security deposits (held/released).
*   **Automated Invoicing**: Professional PDF invoices with agency branding.

### 6. Dynamic Pricing (AI-Lite)
*   **Seasonal Rules**: Higher prices for July/August, lower for off-season.
*   **Weekend Rates**: Automatic adjustment for high-demand weekends.

## Implementation Steps

### Phase 1: Infrastructure & Multi-Agency (3-4 turns)
1.  Update `AgencyController` and `AuthController` for robust agency isolation.
2.  Create the `SuperAdminDashboard` frontend.
3.  Add an Agency configuration page.

### Phase 2: Contracts & Signatures (3-4 turns)
1.  Implement `ContractTemplate` logic in the backend.
2.  Create the `SignaturePad` component.
3.  Add the "Sign Contract" step to the Admin booking management flow.

### Phase 3: Interactive Inspection (3-4 turns)
1.  Design the `CarSilhouette` interactive component.
2.  Update `bookingController` to store coordinate-based damage data.
3.  Implement the comparison view (Check-in vs Check-out).

### Phase 4: Financials & OCR (3-4 turns)
1.  Add payment status management to the dashboard.
2.  Create the Document Scanning UI.
3.  Implement PDF Invoice generation.

## Verification & Testing
*   **Multi-tenancy check**: Verify Agency A cannot see Agency B's data.
*   **Signature verification**: Ensure base64 signatures are correctly stored and rendered in PDFs.
*   **Responsiveness**: Test the Inspection and Signature components on mobile/tablet (critical for rental staff).
