import axios from "axios";

const API_URL = "http://localhost:4000/api";

export const getReviews = async () => {
  const res = await axios.get(`${API_URL}/reviews/hostaway`);
  return res.data;
};
