import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, Switch } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [uniqueProperties, setUniqueProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedTime, setSelectedTime] = useState("All");

  async function fetchReviews() {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "https://flexlivingbackend.vercel.app";
      console.log("Fetching reviews from:", `${apiUrl}/api/reviews/hostaway`);
      const res = await axios.get(`${apiUrl}/api/reviews/hostaway`);
      console.log("Fetched reviews:", res.data);
      setReviews(res.data);
      setFilteredReviews(res.data);
      const properties = [...new Set(res.data.map((r) => r.listingName))];
      setUniqueProperties(properties);
    } catch (err) {
      console.error("Error fetching reviews:", err.message, err.response?.data);
      setError(`Failed to fetch reviews: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprovalToggle(id, approved) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "https://flexlivingbackend.vercel.app";
      await axios.post(`${apiUrl}/api/reviews/${id}/approve`, { approved });
      setReviews((prev) =>
        prev.map((review) =>
          review.id.toString() === id.toString() ? { ...review, approved } : review
        )
      );
      setFilteredReviews((prev) =>
        prev.map((review) =>
          review.id.toString() === id.toString() ? { ...review, approved } : review
        )
      );
    } catch (err) {
      console.error("Error toggling approval:", err);
      setError(`Failed to toggle approval: ${err.message}`);
    }
  }

  const handlePropertyFilter = (event) => {
    const property = event.target.value;
    setSelectedProperty(property);
    applyFilters(property, selectedCategory, selectedSource, selectedTime);
  };

  const handleCategoryFilter = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    applyFilters(selectedProperty, category, selectedSource, selectedTime);
  };

  const handleSourceFilter = (event) => {
    const source = event.target.value;
    setSelectedSource(source);
    applyFilters(selectedProperty, selectedCategory, source, selectedTime);
  };

  const handleTimeFilter = (event) => {
    const time = event.target.value;
    setSelectedTime(time);
    applyFilters(selectedProperty, selectedCategory, selectedSource, time);
  };

  const applyFilters = (property, category, source, time) => {
    let filtered = [...reviews];

    if (property !== "All") {
      filtered = filtered.filter((r) => r.listingName === property);
    }

    if (category !== "All") {
      filtered = filtered.filter((r) =>
        r.categories.some((c) => c.category === category)
      );
    }

    if (source !== "All") {
      filtered = filtered.filter((r) => r.source === source);
    }

    if (time !== "All") {
      const now = new Date();
      filtered = filtered.filter((r) => {
        const reviewDate = new Date(r.date);
        if (time === "Last 30 Days") {
          return now - reviewDate <= 30 * 24 * 60 * 60 * 1000;
        }
        if (time === "Last 90 Days") {
          return now - reviewDate <= 90 * 24 * 60 * 60 * 1000;
        }
        return true;
      });
    }

    setFilteredReviews(filtered);
  };

  const getPerformanceData = () => {
    const performance = uniqueProperties.map((property) => {
      const propertyReviews = reviews.filter((r) => r.listingName === property && r.approved);
      const avgRating =
        propertyReviews.length > 0
          ? propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length
          : 0;
      return { name: property, avgRating: Number(avgRating.toFixed(1)) };
    });
    return performance.filter((p) => p.avgRating > 0);
  };

  const getCategoryTrends = () => {
    const categories = [...new Set(reviews.flatMap((r) => r.categories.map((c) => c.category)))];
    return categories.map((category) => {
      const categoryReviews = reviews
        .filter((r) => r.approved)
        .flatMap((r) => r.categories.filter((c) => c.category === category));
      const avgRating =
        categoryReviews.length > 0
          ? categoryReviews.reduce((sum, c) => sum + c.rating, 0) / categoryReviews.length
          : 0;
      return { name: category, avgRating: Number(avgRating.toFixed(1)) };
    });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "guestName", headerName: "Guest Name", width: 150 },
    { field: "listingName", headerName: "Listing", width: 200 },
    { field: "rating", headerName: "Rating", width: 100 },
    { field: "review", headerName: "Review", width: 300 },
    { field: "date", headerName: "Date", width: 120 },
    { field: "source", headerName: "Source", width: 100 },
    {
      field: "approved",
      headerName: "Approved",
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={() => handleApprovalToggle(params.row.id, !params.value)}
        />
      ),
    },
    {
      field: "details",
      headerName: "Details",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => navigate(`/property/${params.row.id}`)}
        >
          Property Detail
        </Button>
      ),
    },
  ];

  const uniqueCategories = [...new Set(reviews.flatMap((r) => r.categories.map((c) => c.category)))];
  const uniqueSources = [...new Set(reviews.map((r) => r.source))];

  return (
    <Box sx={{ p: 3, maxWidth: "1400px", mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Property</InputLabel>
          <Select value={selectedProperty} onChange={handlePropertyFilter}>
            <MenuItem value="All">All</MenuItem>
            {uniqueProperties.map((property) => (
              <MenuItem key={property} value={property}>
                {property}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select value={selectedCategory} onChange={handleCategoryFilter}>
            <MenuItem value="All">All</MenuItem>
            {uniqueCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Source</InputLabel>
          <Select value={selectedSource} onChange={handleSourceFilter}>
            <MenuItem value="All">All</MenuItem>
            {uniqueSources.map((source) => (
              <MenuItem key={source} value={source}>
                {source}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Time</InputLabel>
          <Select value={selectedTime} onChange={handleTimeFilter}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
            <MenuItem value="Last 90 Days">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 400, width: "100%", mb: 4 }}>
        <DataGrid
          rows={filteredReviews}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoHeight
          getRowId={(row) => row.id}
          sortingOrder={["asc", "desc"]}
          initialState={{
            sorting: {
              sortModel: [{ field: "rating", sort: "desc" }],
            },
          }}
          loading={loading}
        />
      </Box>

      {/* Per-Property Performance */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Per-Property Performance
      </Typography>
      <Box sx={{ height: 300, width: "100%", mb: 4 }}>
        <ResponsiveContainer>
          <BarChart data={getPerformanceData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="avgRating" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Category Trends */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Category Trends
      </Typography>
      <Box sx={{ height: 300, width: "100%" }}>
        <ResponsiveContainer>
          <BarChart data={getCategoryTrends()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="avgRating" fill="#d81b60" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}