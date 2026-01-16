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
