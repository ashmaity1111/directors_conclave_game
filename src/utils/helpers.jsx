import directorsData from "../data/directory.json"
export const getFilteredDirectors = () => {
  if (typeof window === "undefined") return [];

  const userData = localStorage.getItem("userData");
  if (!userData) return [];

  try {
    const parsed = JSON.parse(userData);
    const l3 = parsed?.l3;

    if (!l3) return [];

    // match geography with l3
    return directorsData?.filter(
      (director) => director.geography === l3
    );
  } catch (err) {
    console.error("Invalid userData in localStorage", err);
    return [];
  }
};

export const getInitialTime = (total) => {
  if (total <= 10) return 30;
  if (total <= 20) return 40;
  if (total <= 40) return 80;
  if (total <= 60) return 120;
  if (total <= 80) return 160;
  return 180; // fallback
};
