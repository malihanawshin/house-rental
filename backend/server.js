const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "https://flexlivingdeploy.vercel.app",
      "http://localhost:3000",
    ],
  })
);
app.use(express.json());

// In-memory store for mock reviews
let mockReviews = [];
try {
  const mockData = require("./data/hostaway.mock.json");
  if (mockData && Array.isArray(mockData.result)) {
    mockReviews = mockData.result.map((r) => ({
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
    console.log("Loaded mock reviews:", mockReviews.length);
  } else {
    console.error("hostaway.mock.json has invalid structure");
  }
} catch (err) {
  console.error("Failed to load hostaway.mock.json:", err.message);
}

// Hostaway credentials
const ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID;
const API_KEY = process.env.HOSTAWAY_API_KEY;

// GET /api/reviews/hostaway
app.get("/api/reviews/hostaway", async (req, res) => {
  try {
    // Return mock reviews if available
    if (mockReviews.length > 0) {
      return res.json(mockReviews);
    }

    // Try Hostaway API
    if (!ACCOUNT_ID || !API_KEY) {
      throw new Error("Hostaway API credentials missing");
    }

    const url = `https://api.hostaway.com/v1/reviews?accountId=${ACCOUNT_ID}`;
    const headers = { Authorization: `Bearer ${API_KEY}` };
    const response = await axios.get(url, { headers });

    // Handle empty or invalid API response
    const reviews = Array.isArray(response.data?.result)
      ? response.data.result.map((r) => ({
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
        }))
      : [];

    if (reviews.length === 0) {
      console.log("Hostaway API returned no reviews (sandbox)");
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
    const id = req.params.id; // Keep as string for comparison
    const reviews = mockReviews;

    const propertyReview = reviews.find((r) => r.id.toString() === id);
    if (!propertyReview) {
      return res.status(404).json({ error: "Property not found" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "https://flexlivingdeploy.vercel.app";
    const property = {
      id: propertyReview.id,
      listingName: propertyReview.listingName,
      location: "London, UK",
      description:
        "A modern 2-bedroom apartment in Shoreditch, walking distance to Liverpool Street station. Perfect for families or business stays. The location couldn’t be better – close to all the cool spots in the area, with great transport links. I’ve made sure to provide high-quality amenities, so you’ll feel right at home. Whether you’re here for work or play, it’s an ideal base for your stay. This apartment has 2 comfortable bedrooms, each with a king bed, perfect for a good night’s sleep. The bathroom is modern, and the kitchen is fully equipped with top-notch appliances, ready for you to cook up anything you like. I’ve made sure all duvets and pillows are hypoallergenic, and the bed linen is 100% cotton for that extra comfort. The living room is spacious and there’s also an air mattress available if you need to accommodate an extra guest. Altogether, up to 5 people can stay here comfortably.",
      images: [
        `${frontendUrl}/images/living.jpeg`,
        `${frontendUrl}/images/bedroom.jpeg`,
        `${frontendUrl}/images/kitchen.jpeg`,
        `${frontendUrl}/images/bathroom.jpeg`,
        `${frontendUrl}/images/bedroom2.jpeg`,
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