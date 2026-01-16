export const groupByPlanet = (data) => {
  return data.map((item) => ({
    id: item.id,               // UNIQUE
    planet: item.planet,
    geography: item.geography,
    photo_url: item.photo_url,
    assigned: null,
  }));
};