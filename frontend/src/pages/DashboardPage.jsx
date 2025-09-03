import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Switch, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [uniqueProperties, setUniqueProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const [selectedProperty, setSelectedProperty] = useState("All");

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
    if (property === "All") {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter((r) => r.listingName === property));
    }
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
  ];

  return (
    <Box sx={{ p: 3 }}>
      <h1>Dashboard</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <FormControl sx={{ m: 1, minWidth: 200 }}>
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
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredReviews}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoHeight
          getRowId={(row) => row.id}
          onRowClick={(params) => {
            navigate(`/property/${params.row.id}`, { state: { property: params.row } });
          }}
          sortingOrder={["asc", "desc"]}
          initialState={{
            sorting: {
              sortModel: [{ field: "rating", sort: "desc" }],
            },
          }}
          loading={loading}
        />
      </div>
    </Box>
  );
}