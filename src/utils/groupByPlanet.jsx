export function groupByPlanet(data) {
    const map = {};
  
    data.forEach((item) => {
      const key = `${item.planet}-${item.geography}`;
  
      if (!map[key]) {
        map[key] = {
          id: key,
          planet: item.planet,
          geography: item.geography,
          assigned: null,
        };
      }
    });
  
    return Object.values(map);
  }
  