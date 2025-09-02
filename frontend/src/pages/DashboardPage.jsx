import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Typography,
  Switch,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DashboardPage() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await axios.get("http://localhost:4000/api/reviews/hostaway");
        setReviews(res.data);
        setFilteredReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  // Filter by category and date
  useEffect(() => {
    let temp = [...reviews];
    if (categoryFilter) {
      temp = temp.filter((r) =>
        r.categories?.some((c) => c.category === categoryFilter)
      );
    }
    if (dateFilter) {
      temp = temp.filter((r) => r.date?.startsWith(dateFilter));
    }
    setFilteredReviews(temp);
  }, [categoryFilter, dateFilter, reviews]);

  const handleApproveToggle = async (id, approved) => {
    try {
      await axios.post(`http://localhost:4000/api/reviews/${id}/approve`, {
        approved: !approved,
      });
      // update local state
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, approved: !approved } : r))
      );
    } catch (err) {
      console.error("Error toggling approval:", err);
    }
  };

  const columns = [
    { field: "guestName", headerName: "Guest", flex: 1 },
    { field: "listingName", headerName: "Property", flex: 2 },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1,
    },
    { field: "review", headerName: "Review", flex: 2 },
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "approved",
      headerName: "Approved",
      flex: 1,
      renderCell: (params) => (
        <Switch
          checked={params.row?.approved || false}
          onClick={(e) => e.stopPropagation()} // prevent row click
          onChange={() => handleApproveToggle(params.row.id, params.row.approved)}
        />
      ),
    },
  ];

  if (loading) return <Typography>Loading reviews...</Typography>;

  return (
    <div style={{ padding: "2rem", height: "80vh", width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Manager Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth sx={{ minWidth: 120 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{
                "& .MuiSelect-select": {
                  paddingRight: "24px", // Ensure enough space for the dropdown icon
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="cleanliness">Cleanliness</MenuItem>
              <MenuItem value="communication">Communication</MenuItem>
              <MenuItem value="respect_house_rules">House Rules</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Date (YYYY-MM-DD)"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
      </Grid>

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
      />
    </div>
  );
}