BHOOMISETU V3.2 - Parcel Map & Delay Monitor
============================================

NEW FEATURE
-----------
The Land Parcels page now includes a safe, local-only schematic map and parcel delay monitor.

What it does:
- Search by Parcel ID, village/region, owner, or delay reason.
- Highlights matching parcels on the schematic map.
- Shows On Track / At Risk / Delayed status.
- Click any parcel to open its detailed record.
- Connects delay status to the same workflow state used by the 18-stage lifecycle.
- An open demo grievance for a particular parcel is shown as a parcel-specific delay.
- Project-level blockers such as pending document verification or compensation disbursement can also appear as parcel risk exposure.

SAFETY
------
This is a demonstration map, NOT live GIS.
No GPS, satellite service, cadastral database, government database, payment gateway, or external map API is connected.
All records are sample/demo data stored locally in browser storage.

HOW TO DEMO
-----------
1. Open index.html locally in Chrome.
2. Complete the 18-stage workflow until parcels are identified.
3. Open Land Parcels from the left sidebar.
4. Search a Parcel ID such as MP-IND-004821 or a village name.
5. Click a parcel on the map to inspect its record.
6. After Acquisition Notification, file a demo objection against a selected parcel.
7. Return to Land Parcels. That parcel will show Delayed with the grievance ID as the reason.
8. Resolve the grievance and the parcel returns to the appropriate risk/track state.

This is intended for SIH 2026 presentation and prototype testing only.
