// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Path to mock reviews
const DATA_FILE = path.join(__dirname, "data", "hostaway.mock.json");

// Optional Hostaway sandbox API
const ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID || "61148";
const API_KEY = process.env.HOSTAWAY_API_KEY || "f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152";
// Load reviews from JSON
function loadReviews() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  return data.result.map((r) => ({
    ...r,
    approved: r.approved ?? false,
    rating:
      r.rating ??
      (r.reviewCategory.length > 0
        ? Math.round(
            r.reviewCategory.reduce((acc, c) => acc + c.rating, 0) /
              r.reviewCategory.length
          )
        : null),
    review: r.publicReview,
    date: r.submittedAt,
  }));
}

// Save reviews back to JSON
function saveReviews(reviews) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ status: "success", result: reviews }, null, 2)
  );
}

// ------------------------ ROUTES ------------------------

// 1️⃣ GET /api/reviews/hostaway
app.get("/api/reviews/hostaway", async (req, res) => {
  try {
    let reviews;

    // Try fetching from Hostaway sandbox API
    if (API_KEY && ACCOUNT_ID) {
      const url = `https://api.hostaway.com/v1/reviews?accountId=${ACCOUNT_ID}`;
      const headers = { Authorization: `Bearer ${API_KEY}` };
      const response = await axios.get(url, { headers });

      reviews = response.data.result.map((r) => ({
        id: r.id,
        guestName: r.guestName,
        listingName: r.listingName,
        rating:
          r.rating ??
          (r.reviewCategory.length > 0
            ? Math.round(
                r.reviewCategory.reduce((acc, c) => acc + c.rating, 0) /
                  r.reviewCategory.length
              )
            : null),
        review: r.publicReview,
        date: r.submittedAt,
        categories: r.reviewCategory,
        approved: false,
      }));
    } else {
      // Fallback to local mock JSON
      const data = JSON.parse(fs.readFileSync(DATA_FILE));
      reviews = data.result.map((r) => ({
        id: r.id,
        guestName: r.guestName,
        listingName: r.listingName,
        rating:
          r.rating ??
          (r.reviewCategory.length > 0
            ? Math.round(
                r.reviewCategory.reduce((acc, c) => acc + c.rating, 0) /
                  r.reviewCategory.length
              )
            : null),
        review: r.publicReview,
        date: r.submittedAt,
        categories: r.reviewCategory,
        approved: r.approved ?? false,
      }));
    }

    res.json(reviews);
  } catch (err) {
    //console.error("Failed to fetch Hostaway reviews, using mock JSON:", err.message);

    // fallback to local JSON if sandbox fails
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    const reviews = data.result.map((r) => ({
      id: r.id,
      guestName: r.guestName,
      listingName: r.listingName,
      rating:
        r.rating ??
        (r.reviewCategory.length > 0
          ? Math.round(
              r.reviewCategory.reduce((acc, c) => acc + c.rating, 0) /
                r.reviewCategory.length
            )
          : null),
      review: r.publicReview,
      date: r.submittedAt,
      categories: r.reviewCategory,
      approved: r.approved ?? false,
    }));

    res.json(reviews);
  }
});

// 2️⃣ Toggle review approval
app.post("/api/reviews/:id/approve", (req, res) => {
  const id = parseInt(req.params.id);
  const { approved } = req.body;

  const reviews = loadReviews();
  const review = reviews.find((r) => r.id === id);
  if (!review) return res.status(404).json({ error: "Review not found" });

  review.approved = approved;
  saveReviews(reviews);

  res.json({ success: true, id, approved });
});

// 3️⃣ GET /api/properties/:id
app.get("/api/properties/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const reviews = loadReviews();

  const propertyReview = reviews.find((r) => r.id === id);
  if (!propertyReview)
    return res.status(404).json({ error: "Property not found" });

  // Hardcoded property info + frontend/public/images
  const property = {
    id: propertyReview.id,
    listingName: propertyReview.listingName,
    location: "London, UK",
    description:
      "A modern 2-bedroom apartment in Shoreditch, walking distance to Liverpool Street station. Perfect for families or business stays.",
    images: [
      "http://localhost:3000/images/living.jpg",
      "http://localhost:3000/images/bedroom.jpg",
      "http://localhost:3000/images/kitchen.jpg",
      "http://localhost:3000/images/bathroom.jpg",
    ],
    amenities: ["WiFi", "Kitchen", "Washing Machine", "Balcony", "24/7 Check-in"],
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    reviews: reviews.filter(
      (r) => r.listingName === propertyReview.listingName && r.approved
    ),
  };

  res.json(property);
});

// -------------------------------------------------------

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
