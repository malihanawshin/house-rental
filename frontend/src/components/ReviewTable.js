import React, { useState } from "react";

const ReviewTable = ({ reviews }) => {
  const [approved, setApproved] = useState({});

  const toggleApproval = (id) => {
    setApproved((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Approve</th>
          <th className="border p-2">Guest</th>
          <th className="border p-2">Listing</th>
          <th className="border p-2">Rating</th>
          <th className="border p-2">Review</th>
          <th className="border p-2">Date</th>
        </tr>
      </thead>
      <tbody>
        {reviews.map((r) => (
          <tr key={r.id}>
            <td className="border p-2 text-center">
              <input
                type="checkbox"
                checked={!!approved[r.id]}
                onChange={() => toggleApproval(r.id)}
              />
            </td>
            <td className="border p-2">{r.guestName}</td>
            <td className="border p-2">{r.listingName}</td>
            <td className="border p-2">{r.rating ?? "N/A"}</td>
            <td className="border p-2">{r.review}</td>
            <td className="border p-2">{r.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReviewTable;
