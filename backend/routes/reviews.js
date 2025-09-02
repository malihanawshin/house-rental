const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dataPath = path.join(__dirname, "../data/hostaway.mock.json");

// Helper: read & save data
function readData() {
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}
function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Fetch normalized reviews
router.get("/hostaway", (req, res) => {
  const jsonData = readData();

  const normalized = jsonData.result.map((r) => ({
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
    approved: r.approved || false,
  }));

  res.json(normalized);
});

// Fetch only approved reviews
router.get("/approved", (req, res) => {
  const jsonData = readData();

  const approved = jsonData.result
    .filter((r) => r.approved)
    .map((r) => ({
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
    }));

  res.json(approved);
});

// Approve/unapprove
router.post("/approve/:id", (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;
  const data = readData();

  const review = data.result.find((r) => r.id == id);
  if (review) {
    review.approved = approved;
    saveData(data);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Review not found" });
  }
});

module.exports = router;
