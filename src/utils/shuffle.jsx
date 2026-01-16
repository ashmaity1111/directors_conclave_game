export function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  
  export function paginateAndShuffle(data, pageSize) {
    const pages = [];
  
    for (let i = 0; i < data.length; i += pageSize) {
      const pageChunk = data.slice(i, i + pageSize);
      pages.push(shuffle(pageChunk));
    }
  
    return pages;
  }
  