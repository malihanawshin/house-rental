import React, { useState, useEffect } from "react";
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
  Card,
  CardContent,
  Alert,
  Button,
  Box,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DashboardPage() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [maxRatingFilter, setMaxRatingFilter] = useState("");
  const [uniqueProperties, setUniqueProperties] = useState([]);
  const [overviewData, setOverviewData] = useState({});
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchReviews();
  }, []);

  useEffect(() => {
    let temp = [...reviews];
    if (propertyFilter) {
      temp = temp.filter((r) => r.listingName === propertyFilter);
    }
    if (categoryFilter) {
      temp = temp.filter((r) =>
        r.categories?.some((c) => c.category === categoryFilter)
      );
    }
    if (dateFilter) {
      temp = temp.filter((r) => r.date?.startsWith(dateFilter));
    }
    if (minRatingFilter) {
      temp = temp.filter((r) => r.rating >= parseInt(minRatingFilter));
    }
    if (maxRatingFilter) {
      temp = temp.filter((r) => r.rating <= parseInt(maxRatingFilter));
    }
    setFilteredReviews(temp);
  }, [propertyFilter, categoryFilter, dateFilter, minRatingFilter, maxRatingFilter, reviews]);

  useEffect(() => {
    if (reviews.length === 0) return;

    const totalReviews = reviews.length;
    const approvedCount = reviews.filter((r) => r.approved).length;
    const avgRating = (
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
    ).toFixed(1);
    const lowRatings = reviews.filter((r) => r.rating < 7).length;
    setOverviewData({ totalReviews, approvedCount, avgRating, lowRatings });

    const groupedByMonth = reviews.reduce((acc, r) => {
      const month = r.date.slice(0, 7);
      if (!acc[month]) acc[month] = { month, total: 0, count: 0 };
      acc[month].total += r.rating || 0;
      acc[month].count += 1;
      return acc;
    }, {});
    const timeData = Object.values(groupedByMonth)
      .map((g) => ({ month: g.month, avgRating: (g.total / g.count).toFixed(1) }))
      .sort((a, b) => a.month.localeCompare(b.month));
    setTimeSeriesData(timeData);

    const categories = ["cleanliness", "communication", "respect_house_rules"];
    const catData = categories.map((cat) => {
      const catReviews = reviews.flatMap((r) => r.categories || []).filter((c) => c.category === cat);
      const avg = catReviews.length > 0
        ? (catReviews.reduce((sum, c) => sum + c.rating, 0) / catReviews.length).toFixed(1)
        : 0;
      return { category: cat, avgRating: avg };
    });
    setCategoryData(catData);
  }, [reviews]);

  const handleApproveToggle = async (id, approved) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "https://flexlivingbackend.vercel.app";
      await axios.post(`${apiUrl}/api/reviews/${id}/approve`, {
        approved: !approved,
      });
      setReviews((prev) =>
        prev.map((r) => (r.id.toString() === id.toString() ? { ...r, approved: !approved } : r))
      );
      setFilteredReviews((prev) =>
        prev.map((r) => (r.id.toString() === id.toString() ? { ...r, approved: !approved } : r))
      );
    } catch (err) {
      console.error("Error toggling approval:", err);
      setError(`Failed to toggle approval: ${err.message}`);
    }
  };

  const columns = [
    { field: "guestName", headerName: "Guest", flex: 1, sortable: true },
    { field: "listingName", headerName: "Property", flex: 1.5, sortable: true },
    {
      field: "rating",
      headerName: "Rating",
      flex: 0.5,
      sortable: true,
      renderCell: (params) => (
        <Typography color={params.value < 7 ? "error" : "inherit"}>
          {params.value || "N/A"}
        </Typography>
      ),
    },
    { field: "review", headerName: "Review", flex: 2 },
    { field: "date", headerName: "Date", flex: 1, sortable: true },
    {
      field: "approved",
      headerName: "Approved",
      flex: 0.5,
      sortable: true,
      renderCell: (params) => (
        <Switch
          checked={params.row?.approved || false}
          onClick={(e) => e.stopPropagation()}
          onChange={() => handleApproveToggle(params.row.id, params.row.approved)}
        />
      ),
    },
    {
      field: "details",
      headerName: "Details",
      flex: 1,
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

  if (loading) return <Typography>Loading reviews...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: "4rem", backgroundColor: "#f8f8ea9e", width: "90%", maxWidth: "1400px", mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Manager Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total Reviews</Typography>
              <Typography variant="h5">{overviewData.totalReviews || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Approved Reviews</Typography>
              <Typography variant="h5">{overviewData.approvedCount || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Average Rating</Typography>
              <Typography variant="h5">{overviewData.avgRating || "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Low Ratings ({"<"}7)</Typography>
              <Typography variant="h5" color="error">
                {overviewData.lowRatings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth sx={{ minWidth: 120 }}>
            <InputLabel id="property-label">Property</InputLabel>
            <Select
              labelId="property-label"
              value={propertyFilter}
              label="Property"
              onChange={(e) => setPropertyFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueProperties.map((prop) => (
                <MenuItem key={prop} value={prop}>
                  {prop}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
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
                  paddingRight: "24px",
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
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Min Rating"
            type="number"
            value={minRatingFilter}
            onChange={(e) => setMinRatingFilter(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Max Rating"
            type="number"
            value={maxRatingFilter}
            onChange={(e) => setMaxRatingFilter(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Reviews
      </Typography>
      <DataGrid
        rows={filteredReviews}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        autoHeight
        getRowId={(row) => row.id}
        sortingOrder={["asc", "desc"]}
        getRowHeight={() => "auto"}   // auto-adjust row height
        initialState={{
          sorting: {
            sortModel: [{ field: "rating", sort: "desc" }],
          },
        }}
      />

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Trends & Insights
      </Typography>
      {filteredReviews.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Average Rating Over Time</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgRating" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Average Rating by Category</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgRating" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          {overviewData.lowRatings > 0 && (
            <Grid item xs={12}>
              <Alert severity="warning">
                There are {overviewData.lowRatings} low-rated reviews. Check for recurring issues in cleanliness or house rules.
              </Alert>
            </Grid>
          )}
        </Grid>
      ) : (
        <Typography>No data available for trends.</Typography>
      )}
    </Box>
  );
}