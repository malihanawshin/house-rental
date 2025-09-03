import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  People,
  Hotel,
  Bathtub,
  Wifi,
  Kitchen,
  LocalLaundryService,
  Balcony,
  AccessTime,
} from "@mui/icons-material";
import axios from "axios";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

// Define libraries as a constant outside the component
const GOOGLE_MAPS_LIBRARIES = ["places"];

export default function PropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

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
  if (loadError) return <Typography>Error loading Google Maps.</Typography>;

  // Map container style
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "8px",
  };

  // Center map on Shoreditch, London (hardcoded, adjust if API provides coordinates)
  const center = {
    lat: 51.524,
    lng: -0.080,
  };

  return (
    <Box sx={{ padding: { xs: "1rem", md: "2rem" }, maxWidth: "1400px", mx: "auto" }}>
      {/* Images */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {property.images?.map((img, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <img
              src={img}
              alt={`property-${idx}`}
              style={{
                width: "100%",
                borderRadius: 12,
                height: 200,
                objectFit: "cover",
              }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Heading */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        {property.listingName}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        {property.location}
      </Typography>

      {/* Amenities Summary with Icons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Chip
          icon={<People />}
          label={`${property.guests} Guests`}
          variant="outlined"
        />
        <Chip
          icon={<Hotel />}
          label={`${property.bedrooms} Bedrooms`}
          variant="outlined"
        />
        <Chip
          icon={<Bathtub />}
          label={`${property.bathrooms} Bathroom${property.bathrooms > 1 ? "s" : ""}`}
          variant="outlined"
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Two-Column Layout */}
      <Grid container spacing={4}>
        {/* Left Column: About, Amenities, Stay Policies, Reviews */}
        <Grid item xs={12} md={8}>
          {/* About */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            About This Property
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This spacious apartment in Old Street is perfect for anyone looking for a
            comfortable, modern place to stay. The location couldn’t be better – close to
            all the cool spots in the area, with great transport links. I’ve made sure to
            provide high-quality amenities, so you’ll feel right at home. Whether you’re
            here for work or play, it’s an ideal base for your stay.
          </Typography>

          {/* Amenities List */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            Amenities
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {property.amenities?.length > 0 ? (
              property.amenities.map((amenity, idx) => (
                <Grid item xs={6} sm={4} key={idx}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {amenity === "WiFi" && <Wifi />}
                    {amenity === "Kitchen" && <Kitchen />}
                    {amenity === "Washing Machine" && <LocalLaundryService />}
                    {amenity === "Balcony" && <Balcony />}
                    {amenity === "24/7 Check-in" && <AccessTime />}
                    <Typography variant="body2">{amenity}</Typography>
                  </Box>
                </Grid>
              ))
            ) : (
              <Typography>No amenities listed.</Typography>
            )}
          </Grid>

          {/* Stay Policies */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            Stay Policies
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Check-in and Check-out</Typography>
            <Typography variant="body2">
              Check-in: After 3:00 PM
              <br />
              Check-out: Before 11:00 AM
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              House Rules
            </Typography>
            <Typography variant="body2">
              - No smoking
              <br />
              - No pets
              <br />
              - No parties or events
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Cancellation Policy
            </Typography>
            <Typography variant="body2">
              Free cancellation up to 7 days before check-in. 50% refund for
              cancellations within 7 days.
            </Typography>
          </Box>

          {/* Approved Reviews */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            Guest Reviews
          </Typography>
          {property.reviews?.length > 0 ? (
            <Grid container spacing={2}>
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
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No approved reviews yet.</Typography>
          )}
        </Grid>

        {/* Right Column: Book Your Stay */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 2,
              position: { md: "sticky" },
              top: { md: "2rem" },
              maxWidth: { md: 400 },
              mx: { xs: "auto", md: 0 },
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Book Your Stay
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Check-in Date"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Check-out Date"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="guests-label">Number of Guests</InputLabel>
                <Select
                  labelId="guests-label"
                  value={guests}
                  label="Number of Guests"
                  onChange={(e) => setGuests(e.target.value)}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} Guest{num > 1 ? "s" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => alert("Availability check not implemented yet.")}
              >
                Check Availability
              </Button>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => alert("Inquiry form not implemented yet.")}
              >
                Send Inquiry
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Location Map */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Location
      </Typography>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={center} title={property.listingName} />
        </GoogleMap>
      ) : (
        <Typography>Loading map...</Typography>
      )}
    </Box>
  );
}