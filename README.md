# Flex Living Reviews Dashboard

A full-stack web application for managing and analyzing property reviews from **Hostaway**, with an interactive dashboard to view, filter, and approve reviews, visualize performance trends, and access property details.

## Features

* **Reviews Dashboard** – Browse reviews in a DataGrid with filters by property, category, date, and rating range.
* **Property Details** – View detailed property information (amenities, reviews, location map) via the **Property Detail** button.
* **Performance Insights** – Visualize per-property and category review trends using bar and line charts.
* **Review Management** – Approve or reject reviews directly from the dashboard.
* **Google Maps Integration** – Display property locations (e.g., Shoreditch, London) on an interactive map.

## Tech Stack

* **Frontend**: React, Material-UI, Recharts, Axios, React Router, Google Maps React
* **Backend**: Node.js, Express, Axios, dotenv, CORS
* **Deployment**: Vercel (frontend & backend)
* **Data**: Hostaway API (with fallback to `backend/data/hostaway.mock.json`)

## Prerequisites

* Node.js **v18+**
* npm
* Git
* Vercel CLI (`npm install -g vercel`)
* Google Maps API key (for property maps)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/<your-username>/flex-living-reviews-dashboard.git
cd flex-living-reviews-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
FRONTEND_URL=http://localhost:3000
HOSTAWAY_ACCOUNT_ID=your_account_id
HOSTAWAY_API_KEY=your_api_key
```

Run backend:

```bash
npm start
```

Verify: [http://localhost:4000/api/reviews/hostaway](http://localhost:4000/api/reviews/hostaway)

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_api_key
```

Run frontend:

```bash
npm start
```

Verify: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

Place images (`living.jpeg`, `bedroom.jpeg`, `kitchen.jpeg`, `bathroom.jpeg`) in:

```
frontend/public/images/
```

## Deployment

### Backend

```bash
cd backend
vercel --prod
```

Set Vercel environment variables:

```env
FRONTEND_URL=https://flexlivingdeploy.vercel.app
HOSTAWAY_ACCOUNT_ID=your_account_id
HOSTAWAY_API_KEY=your_api_key
```

Project name: `flex-living-reviews-backend`

### Frontend

```bash
cd ../frontend
vercel --prod
```

Set Vercel environment variables:

```env
REACT_APP_API_URL=https://flex-living-reviews-backend.vercel.app
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_api_key
```

Project name: `flexlivingdeploy`


### Verify Deployment

* Dashboard: [https://flexlivingdeploy.vercel.app/dashboard](https://flexlivingdeploy.vercel.app/dashboard)
* Property Page: [https://flexlivingdeploy.vercel.app/property/7453](https://flexlivingdeploy.vercel.app/property/7453)
* API: [https://flex-living-reviews-backend.vercel.app/api/reviews/hostaway](https://flex-living-reviews-backend.vercel.app/api/reviews/hostaway)


## API Endpoints

* `GET /api/reviews/hostaway` → Fetch all reviews
* `POST /api/reviews/:id/approve` → Update review approval status
* `GET /api/properties/:id` → Get property details + reviews

## Testing

**Local**

1. Run backend (`npm start` inside `/backend`).
2. Run frontend (`npm start` inside `/frontend`).
3. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).
4. Click *Property Detail* for property ID `7453`.
5. Check DevTools Console/Network for errors.

**Production**

1. Visit: [https://flexlivingdeploy.vercel.app/dashboard](https://flexlivingdeploy.vercel.app/dashboard)
2. Verify filters, charts, and property pages.
3. Debug with:

   ```bash
   vercel logs flexlivingdeploy.vercel.app
   vercel logs flex-living-reviews-backend.vercel.app
   ```
