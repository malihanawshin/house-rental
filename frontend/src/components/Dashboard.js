import React, { useEffect, useState } from "react";
import Filters from "./Filters";
import ReviewTable from "./ReviewTable";

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ rating: "", category: "" });

  useEffect(() => {
    fetch("http://localhost:4000/api/reviews/hostaway")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setFiltered(data);
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  // Apply filters
  useEffect(() => {
    let temp = [...reviews];
    if (filters.rating) {
      temp = temp.filter((r) => r.rating === parseInt(filters.rating));
    }
    if (filters.category) {
      temp = temp.filter((r) =>
        r.categories.some((c) => c.category === filters.category)
      );
    }
    setFiltered(temp);
  }, [filters, reviews]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
      <Filters filters={filters} setFilters={setFilters} />
      <ReviewTable reviews={filtered} />
    </div>
  );
};

export default Dashboard;
