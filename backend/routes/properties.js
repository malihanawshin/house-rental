const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

function readData() {
  const data = fs.readFileSync(path.join(__dirname, "../data/properties.mock.json"));
  return JSON.parse(data);
}

// GET property by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const data = readData();

  if (data[id]) {
    res.json(data[id]);
  } else {
    res.status(404).json({ error: "Property not found" });
  }
});

module.exports = router;
