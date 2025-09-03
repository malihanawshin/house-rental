const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "https://flex-living-reviews-frontend.vercel.app" }));
app.use(express.json());

// In-memory store for mock reviews
let mockReviews = [];
try {
  const mockData = require("./data/hostaway.mock.json");
  mockReviews = (mockData.result || []).map((r) => ({
    id: r.id,
    guestName: r.guestName,
    listingName: r.listingName,
    rating:
      r.rating ??
      (r.reviewCategory?.length > 0
        ? Math.round(
            r.reviewCategory.reduce((acc, c) => acc + c.rating, 0) /
              r.reviewCategory.length
          )
        : null),
    review: r.publicReview,
    date: r.submittedAt,
    categories: r.reviewCategory || [],
    approved: r.approved ?? false,
    source: "hostaway",
  }));
} catch (err) {
  console.error("Failed to load hostaway.mock.json:", err.message);
}

// Hostaway credentials
const ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID;
const API_KEY = process.env.HOSTAWAY_API_KEY;

// GET /api/reviews/hostaway
app.get("/api/reviews/hostaway", async (req, res) => {
  try {
    let reviews = [];

    // Try Hostaway API
    if (ACCOUNT_ID && API_KEY) {
      const url = `https://api.hostaway.com/v1/reviews?accountId=${ACCOUNT_ID}`;
      const headers = { Authorization: `Bearer ${API_KEY}` };
      const response = await axios.get(url, { headers });
      reviews = response.data.result.map((r) => ({
        id: r.id,
        guestName: r.guestName,
        listingName: r.listingName,
        rating:
          r.rating ??
          (r.reviewCategory?.length > 0
            ? Math.round(
                r.reviewCategory.reduce((acc, c) => acc + c.rating, 0) /
                  r.reviewCategory.length
              )
            : null),
        review: r.publicReview,
        date: r.submittedAt,
        categories: r.reviewCategory || [],
        approved: r.approved ?? false,
        source: "hostaway",
      }));
    } else {
      // Use in-memory mock data
      if (mockReviews.length === 0) {
        throw new Error("No mock reviews available");
      }
      reviews = [...mockReviews];
    }

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    res.status(500).json({ error: `Failed to fetch reviews: ${err.message}` });
  }
});

// POST /api/reviews/:id/approve
app.post("/api/reviews/:id/approve", (req, res) => {
  try {
    const id = req.params.id;
    const { approved } = req.body;

    const reviewIndex = mockReviews.findIndex((r) => r.id.toString() === id);
    if (reviewIndex === -1) {
      return res.status(404).json({ error: "Review not found" });
    }

    mockReviews[reviewIndex].approved = approved;
    res.json({ success: true, id, approved });
  } catch (err) {
    console.error("Error approving review:", err.message);
    res.status(500).json({ error: `Failed to approve review: ${err.message}` });
  }
});

// GET /api/properties/:id
app.get("/api/properties/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reviews = mockReviews;

    const propertyReview = reviews.find((r) => r.id === id);
    if (!propertyReview) {
      return res.status(404).json({ error: "Property not found" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "https://flex-living-reviews-frontend.vercel.app";
    const property = {
      id: propertyReview.id,
      listingName: propertyReview.listingName,
      location: "London, UK",
      description:
        "A modern 2-bedroom apartment in Shoreditch, walking distance to Liverpool Street station. Perfect for families or business stays.",
      images: [
        `${frontendUrl}/images/living.jpeg`,
        `${frontendUrl}/images/bedroom.jpeg`,
        `${frontendUrl}/images/kitchen.jpeg`,
        `${frontendUrl}/images/bathroom.jpeg`,
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
  } catch (err) {
    console.error("Error fetching property:", err.message);
    res.status(500).json({ error: `Failed to fetch property: ${err.message}` });
  }
});

module.exports = app;