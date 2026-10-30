# NPL Cricket Auction — runnable MVP

A mobile-friendly cricket player auction app with one admin, public live view and individual team dashboards. Admin enters all bids; team owners only view results.

## Requirements
- Node.js 20 or 22 (with npm)
- A computer/server that stays running during the auction

## Start
```bash
cd cricket-auction
npm install
cp .env.example .env
```
Edit `.env` and set `ADMIN_PIN` to a unique secret of at least 8 characters.

```bash
npm start
```

Open:
- Admin: http://localhost:3000/admin
- Public: http://localhost:3000/live
- Team: http://localhost:3000/team/1 (through /team/12 for the initial 12 teams)

For phones on the same Wi-Fi, use `http://YOUR_COMPUTER_LAN_IP:3000/live`. For remote access, deploy to a Node.js host with persistent storage and HTTPS, then share its URL. **Do not use ephemeral disk hosting** without configuring persistent volume for `auction.sqlite`.

## Auction workflow
1. Log in as admin.
2. Rename Team 1–12 as desired and edit their budgets.
3. Add players and their base prices.
4. Click Activate for the player being auctioned.
5. Choose winning team and final bid; click Confirm SOLD and approve the confirmation dialog, or Mark UNSOLD.
6. Budget and team roster update in real time for all connected viewers.
7. Undo Last Sold / Unsold reverses the latest result and restores the budget.

## Features
- SQLite persistence: `auction.sqlite` created on first launch.
- 12 seeded teams with ₹100,000 budget each.
- Server-side validation of budget, base price and active player.
- Atomic SOLD/UNSOLD transactions; prevents double selling.
- Team management, player management, live updates via Socket.IO.
- Public view requires no login; team pages show squad and remaining wallet.
- Admin access protected by a PIN; session tokens are held in memory and reset when server restarts.

## Notes and deployment precautions
This is a usable **MVP**, not a production-hardened multi-admin platform. Only one trusted admin should operate it. For internet deployment, add HTTPS, rate limiting on login, secure session persistence, backups, monitoring, and a reverse proxy. The current undo reverses the latest auction result only, not arbitrary historical results. No photo uploads, Excel import/export, bidding increments, player quotas or owner bidding are included. No actual money is transferred: all amounts are auction wallet units.

Keep a copy of `auction.sqlite` (preferably while the server is stopped) to back up results.

## Deploy with a public link (Render)

The Render blueprint is in render.yaml. It runs the app as one Node web service and mounts a persistent disk for SQLite uploads and auction data. This disk requires a paid Render web service; Render free web services lose local data on restart/redeploy and do not support persistent disks.

1. Push the contents of this cricket-auction folder to a GitHub repository. Keep .env and all auction.sqlite files out of Git; .gitignore already excludes them.
2. In Render, choose New > Blueprint, connect the repository, and deploy the render.yaml blueprint.
3. Set the ADMIN_PIN secret when Render asks. Use a unique, long secret; do not reuse the local PIN.
4. Wait for the deploy to pass /api/state health check. Share the resulting https://<service-name>.onrender.com/live link. Admin: /admin; team dashboards are under /team.
5. Test admin login, a team dashboard, and one SOLD/UNSOLD action from two separate devices before the auction.

Socket.IO updates are broadcast by the single running service, so connected browsers see auction changes live. The persistent disk keeps the database and uploaded photos across restarts and deploys. Keep regular database backups: a persistent disk is not a backup, and this app currently runs as a single instance.

## Split deployment (Netlify frontend + Render backend)

The Netlify configuration is in netlify.toml. Keep the Render service as the backend because it owns SQLite persistence and the live Socket.IO connection.

1. Deploy the Render Blueprint first. You can leave FRONTEND_ORIGIN blank during its first deploy.
2. Create a Netlify site from the same GitHub repository. Netlify reads netlify.toml automatically.
3. In Netlify site environment variables, set AUCTION_BACKEND_URL to the Render service origin, for example https://npl-cricket-auction.onrender.com (no /live or trailing path). Trigger a new deploy.
4. Copy the Netlify site's origin, such as https://your-auction.netlify.app, into the Render FRONTEND_ORIGIN environment variable and redeploy the backend.
5. Share the Netlify /live link. Use /admin for the auctioneer and /team for team dashboards.

The browser connects directly to the Render backend for API calls and Socket.IO; Netlify serves the interface and rewrites app routes to index.html. Uploaded photos and auction data remain on Render's persistent disk.
