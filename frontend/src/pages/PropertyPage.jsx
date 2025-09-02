import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";

export default function PropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`http://localhost:4000/api/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <Typography>Loading property details...</Typography>;
  if (!property) return <Typography>Property not found.</Typography>;

  return (
    <div style={{ padding: "2rem" }}>
      {/* Property Header */}
      <Typography variant="h4">{property.listingName}</Typography>
      <Typography variant="subtitle1">{property.location}</Typography>
      <Typography sx={{ mt: 2 }}>{property.description}</Typography>

      {/* Images */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {property.images?.map((img, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <img
              src={img}
              alt={`property-${idx}`}
              style={{ width: "100%", borderRadius: 12, height: 200, objectFit: "cover" }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Amenities */}
      <Typography variant="h6" sx={{ mt: 4 }}>Amenities</Typography>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        {property.amenities?.length > 0 ? (
          property.amenities.map((amenity, idx) => (
            <Grid item key={idx}>
              <Chip label={amenity} color="primary" variant="outlined" />
            </Grid>
          ))
        ) : (
          <Typography>No amenities listed.</Typography>
        )}
      </Grid>

      {/* Details */}
      <Typography variant="h6" sx={{ mt: 4 }}>Details</Typography>
      <Typography>Bedrooms: {property.bedrooms}</Typography>
      <Typography>Bathrooms: {property.bathrooms}</Typography>
      <Typography>Guests: {property.guests}</Typography>

      <Divider sx={{ my: 3 }} />

      {/* Approved Reviews */}
      <Typography variant="h6" sx={{ mt: 4 }}>Guest Reviews</Typography>
      {property.reviews?.length > 0 ? (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {property.reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">
                    <b>{review.guestName}</b> — {review.date}
                  </Typography>
                  <Typography variant="body2">
                    Overall Rating: ⭐ {review.rating}/10
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {review.review}
                  </Typography>
                  {/* Category ratings */}
                  {review.categories?.length > 0 && (
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {review.categories.map((cat, idx) => (
                        <Grid item key={idx}>
                          <Chip
                            label={`${cat.category}: ${cat.rating}/10`}
                            size="small"
                            color="secondary"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No approved reviews yet.</Typography>
      )}
    </div>
  );
}
