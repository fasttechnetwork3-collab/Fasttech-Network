FASTTECH NETWORK — EDITABLE WEBSITE SOURCE PROJECT
==================================================

FILES
- index.html: Public business website
- dashboard.html: Customer dashboard UI demo (not connected to live customer records)
- admin.html: Visual Admin Panel
- style.css: Full responsive design
- app.js: Public website rendering
- admin.js: Admin editing functions
- assets/: Logo and favicon

ADMIN FEATURES
- Edit company name, intro, phone, WhatsApp, address and support hours
- Upload/change logo and hero banner
- Add, edit and delete internet packages, including package photos
- Upload multiple gallery photos and delete gallery items
- Download and restore JSON backup

WINDOWS QUICK START
1. Extract this ZIP file.
2. Open the folder.
3. Double-click index.html to preview the website.
4. Open admin.html in the same browser to edit demo content.
5. Keep images below 1.5 MB each for this demo.

EDIT SOURCE CODE
- Use Visual Studio Code or another text editor.
- Edit HTML structure in index.html / admin.html / dashboard.html.
- Edit appearance in style.css.
- Edit website behaviour in app.js and admin.js.

CLOUDFLARE PAGES / GITHUB
- Upload the CONTENTS of this folder to the repository root (index.html must be at root).
- In Cloudflare Pages connect the GitHub repository.
- Framework preset: None; Build command: blank; Build output directory: / (root).

IMPORTANT PRODUCTION NOTES
This is a static front-end starter. Admin changes are saved only in the same browser using Local Storage; they do not publish changes to all visitors or sync between devices. There is no secure admin authentication in this starter. The customer dashboard login is a visual demo, not real subscriber authentication.
For production, connect a secure backend/database (e.g. Supabase or a Cloudflare Worker + database), enforce server-side authentication and role permissions, and integrate your billing/ISP system. Do not put secrets, customer passwords, or payment credentials in frontend files or Local Storage.


DEFAULT INTERNET PACKAGES
- Padma Pluse — 25 Mbps — ৳525
- Meghna — 35 Mbps — ৳600
- Jamuna — 40 Mbps — ৳700
- Turbo — 50 Mbps — ৳800
- Flash — 100 Mbps — ৳1000
Each package has its own SVG illustration in assets/package-1.svg through package-5.svg.
