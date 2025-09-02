import React from "react";

const Filters = ({ filters, setFilters }) => {
  return (
    <div className="flex gap-4 mb-4">
      <select
        value={filters.rating}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, rating: e.target.value }))
        }
        className="border px-2 py-1"
      >
        <option value="">All Ratings</option>
        <option value="10">10</option>
        <option value="9">9</option>
        <option value="8">8</option>
      </select>

      <select
        value={filters.category}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, category: e.target.value }))
        }
        className="border px-2 py-1"
      >
        <option value="">All Categories</option>
        <option value="cleanliness">Cleanliness</option>
        <option value="communication">Communication</option>
        <option value="respect_house_rules">House Rules</option>
      </select>
    </div>
  );
};

export default Filters;
