import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  AccessTime,
  Fullscreen,
  Tv,
  Lan,
  Restaurant,
  LocalLaundryService,
  Dry,
  Thermostat,
  SmokeFree,
  Security,
  Pets, Celebration, ShieldOutlined
} from "@mui/icons-material";

import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import axios from "axios";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";


// Define libraries as a constant outside the component
const GOOGLE_MAPS_LIBRARIES = ["places"];

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        const apiUrl =
          process.env.REACT_APP_API_URL || "https://flexlivingbackend.vercel.app";
        console.log("Fetching property from:", `${apiUrl}/api/properties/${id}`);
        const res = await axios.get(`${apiUrl}/api/properties/${id}`);
        console.log("Fetched property:", res.data);
        setProperty(res.data);
      } catch (err) {
        console.error("Error fetching property:", err.message, err.response?.data);
        setError(err.response?.data?.error || "Failed to fetch property");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <Typography>Loading property details...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
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
    lng: -0.08,
  };

  return (
      <Box
 sx={{
     px: { xs: "2rem", md: "6rem" }, // more left/right padding
     py: { xs: "2rem", md: "4rem" }, // keep top/bottom same
     backgroundColor: "#f8f8ea9e",
     maxWidth: "1600px", // give content more breathing room
     mx: "auto",
   }}
 >
      {/* Back to Dashboard Button */}
      <Button onClick={() => navigate("/dashboard")} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      {/* Images Gallery (Aligned with Book Your Stay) */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
          {/* Large Feature Image (Left Column) */}
          {property.images?.length > 0 && (
            <Box sx={{ flex: 1, maxWidth: { md: "50%" } }}>
              <img
                src={property.images[0]}
                alt="property-feature"
                style={{
                  width: "100%",
                  height: 600,
                  objectFit: "cover",
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  display: "block",
                }}
              />
            </Box>
          )}

          {/* Smaller Images (Right Column, aligned with Book Your Stay) */}
          {property.images?.length > 1 && (
            <Box
              sx={{
                flex: 1,
                maxWidth: { md: "50%" },
                display: "grid",
                gridTemplateRows: "1fr 1fr",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                height: 600,
                position: "relative",
              }}
            >
              {property.images.slice(1, 5).map((img, idx) => (
                <Box key={idx} sx={{ position: "relative" }}>
                  <img
                    src={img}
                    alt={`property-${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 0,
                      ...(idx === 0 && { borderTopRightRadius: 8 }),
                      ...(idx === 3 && { borderBottomRightRadius: 8 }),
                    }}
                  />
                  {/* Add button only on bottom-right image */}
                  {idx === 3 && (
                    <Button
                      variant="contained"
                      startIcon={<Fullscreen />}
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        borderRadius: "10px",
                        backgroundColor: "white",
                        color: "black",
                        textTransform: "none",
                        fontWeight: "bold",
                        px: 2,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      View all photos
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Heading */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
        {property.listingName}
      </Typography>

      {/* Amenities Summary with Icons */}
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <Chip
        icon={<People />}
        label={`${property.guests} Guests`}
        sx={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
      />
      <Chip
        icon={<Hotel />}
        label={`${property.bedrooms} Bedrooms`}
        sx={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
      />
      <Chip
        icon={<Bathtub />}
        label={`${property.bathrooms} Bathroom${property.bathrooms > 1 ? "s" : ""}`}
        sx={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
      />
    </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Two-Column Layout with Sticky Right Column */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        {/* Left Column: Cards for content */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { md: "70%" },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* About */}
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                About this property
              </Typography>
              <Typography variant="body1">{property.description}</Typography>
            </CardContent>
          </Card>

          {/* Amenities */}

          <Box sx={{ mt: 1, p: 3, bgcolor: "white", borderRadius: 3, boxShadow: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Amenities
              </Typography>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  color: "#064e3b",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}
              >
                View all amenities
              </Button>
            </Box>

            {/* Amenities Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Tv fontSize="small" />
                  <Typography> Cable TV </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Lan fontSize="small" />
                  <Typography> Internet </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Wifi fontSize="small" />
                  <Typography> Wireless </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Restaurant fontSize="small" />
                  <Typography> Kitchen </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <LocalLaundryService fontSize="small" />
                  <Typography> Washing Machine </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Dry fontSize="small" />
                  <Typography> Hair Dryer </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Thermostat fontSize="small" />
                  <Typography> Heating </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <SmokeFree fontSize="small" />
                  <Typography> Smoke Detector </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Security fontSize="small" />
                  <Typography> Carbon Monoxide Detector </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Stay Policies */}
          
          {/* Stay Policies */}
<Card sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
    Stay Policies
  </Typography>

  {/* Check-in & Check-out */}
  <Box sx={{ mb: 3, bgcolor: "#f3f6f2", p: 2, borderRadius: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <AccessTime sx={{ mr: 1, color: "#264d45" }} />
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        Check-in & Check-out
      </Typography>
    </Box>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} sx={{ width: '49%' }}>
        <Box
          sx={{
            bgcolor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Check-in time
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            3:00 PM
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} sx={{ width: '48%' }}>
        <Box
          sx={{
            bgcolor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Check-out time
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            10:00 AM
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </Box>

  {/* House Rules */}
  <Box sx={{ mb: 3, bgcolor: "#f3f6f2", p: 2, borderRadius: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Security sx={{ mr: 1, color: "#264d45" }} />
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        House Rules
      </Typography>
    </Box>
    <Grid container spacing={2}>
      {[
        { label: "No smoking", icon: <SmokeFree /> },
        { label: "No pets", icon: <Pets /> },
        { label: "No parties or events", icon: <Celebration /> },
        { label: "Security deposit required", icon: <ShieldOutlined /> },
      ].map((rule, idx) => (
        <Grid item xs={12} sm={6} key={idx}>
          <Box
            sx={{
              bgcolor: "white",
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Typography fontSize="small">{rule.icon}</Typography>
            <Typography variant="body2">{rule.label}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>

  {/* Cancellation Policy */}
  <Box sx={{ bgcolor: "#f3f6f2", p: 2, borderRadius: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <AccessTime sx={{ mr: 1, color: "#264d45" }} />
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        Cancellation Policy
      </Typography>
    </Box>

    <Box
      sx={{
        bgcolor: "white",
        p: 2,
        borderRadius: 2,
        mb: 2,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        For stays less than 28 days
      </Typography>
      <Typography variant="body2">• Full refund up to 14 days before check-in</Typography>
      <Typography variant="body2">
        • No refund for bookings less than 14 days before check-in
      </Typography>
    </Box>

    <Box
      sx={{
        bgcolor: "white",
        p: 2,
        borderRadius: 2,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        For stays of 28 days or more
      </Typography>
      <Typography variant="body2">• Full refund up to 30 days before check-in</Typography>
      <Typography variant="body2">
        • No refund for bookings less than 30 days before check-in
      </Typography>
    </Box>
  </Box>
</Card>


          {/* Guest Reviews */}
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                Guest Reviews
              </Typography>
              {property.reviews?.length > 0 ? (
                <Grid container spacing={2}>
                  {property.reviews.map((review) => (
                    <Grid item xs={12} key={review.id}>
                      <Card variant="outlined">
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
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
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
            </CardContent>
          </Card>
        </Box>

        {/* Right Column: Sticky Book Your Stay */}{/* Right Column: Book Your Stay (Sticky) */}
      <Box
        sx={{
          width: { xs: "100%", md: "30%" },
          position: { md: "sticky" },
          top: { md: "2rem" },
          alignSelf: { md: "flex-start" },
          zIndex: 1000,
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 3,
            width: "100%",
            maxWidth: "100%",
            mx: { xs: "auto", md: 0 },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: "#264d45", // dark green
              color: "white",
              p: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Book your stay
            </Typography>
            <Typography variant="body2">Select dates to see the total price</Typography>
          </Box>

          {/* Content */}
          <CardContent sx={{ p: 2 }}>
            {/* Dates + Guests (side by side like in screenshot) */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 2,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  backgroundColor: "#f5f7f3",
                  borderColor: "transparent",
                  color: "black",
                  borderRadius: 2,
                  height: 50,
                }}
                startIcon={<CalendarTodayOutlinedIcon/>}
              >
                Select dates
              </Button>

              <FormControl sx={{ minWidth: 80 }}>
                <Select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  displayEmpty
                  sx={{
                    backgroundColor: "#f5f7f3",
                    borderRadius: 2,
                    height: 50,
                  }}
                  renderValue={(selected) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <People fontSize="small" />
                    <Typography>{selected}</Typography>
                  </Box>
                )}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} 
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Check Availability */}
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#7d8f89",
                color: "white",
                textTransform: "none",
                borderRadius: 2,
                fontWeight: "bold",
                mb: 2,
                height: 50,
                "&:hover": { backgroundColor: "#6d7f79" },
              }}
              startIcon={<EventAvailableOutlinedIcon />}
              onClick={() => alert("Availability check not implemented yet.")}
            >
              Check availability
            </Button>

            {/* Send Inquiry */}
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderColor: "#cfd4d1",
                color: "#264d45",
                textTransform: "none",
                borderRadius: 2,
                fontWeight: "bold",
                height: 50,
                mb: 2,
                "&:hover": { backgroundColor: "#f9f9f9" },
              }}
              startIcon={<ContactSupportOutlinedIcon />}
              onClick={() => alert("Inquiry form not implemented yet.")}
            >
              Send Inquiry
            </Button>

            {/* Bottom note */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 1 }}>
              <ShieldOutlined sx={{ fontSize: 18, mr: 1, color: "gray" }} />
              <Typography variant="body2" sx={{ color: "gray" }}>
                Instant confirmation
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      </Box>
    </Box>
  );
}
