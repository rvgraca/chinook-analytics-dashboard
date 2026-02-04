export function formatCurrency(value, locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}


export function formatNumber(value, locale = "en-US") {
  return new Intl.NumberFormat(locale).format(value);
}


export function generateColors(n) {
  return Array.from({ length: n }, (_, i) =>
    `hsl(${(i * 360) / n}, 70%, 60%)`
  );
}


export function downsample(data, step) {
    const result = [];
    for (let i = 0; i < data.length; i += step) {
        result.push(data[i]);
    }
    return result;
}

export function getLastYearData(data) {
    const dates = data.map(r => new Date(r.date));

    const maxDate = new Date(Math.max(...dates));
    const oneYearAgo = new Date(maxDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return data.filter(row => {
        const d = new Date(row.date);
        return d >= oneYearAgo && d <= maxDate;
    });
}

// helper simple para evitar inyectar HTML accidentalmente
export function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildRevenueSeriesByGenre(rows, { maxGenres = 5 } = {}) {
  /*
  {maxGenres = 5 } = {}
  the = {} allows for the user to pass no arguments to the function. 
  if maxGenres is undefined OR the parameter is not defined, the object {maxGenres: 5} is defined by default.
  */

  if (!Array.isArray(rows)) { //this checks whether rows is an array. If not, returns a dictionary with empty arrays.
    console.warn("revenueByTopGenresOverTime: rows no es array", rows);
    return { periods: [], genres: [], seriesByGenre: {}, rowsUsed: 0 };
  }

  // 1) Normalizar/filtrar filas mínimas válidas
  /*
  the filter function returns a subset of values inside an array that satisfy a given condition.
  r && checks that r is not null.
  typeof r.period === "string" && typeof r.genre === "string" checks that both genres and periods are strings.
  
  the map function applies a function to each element of an array.
  In this case, for each row in the array, we put it inside a structured dictionary. 
  If r.revenue is a string with a number inside, we transform it into a number. If the value inside is of another type, we return zero.
  Also, if the value at that position is none, we put zero. 
  
  */



  const clean = rows
    .filter(r => r && typeof r.period === "string" && typeof r.genre === "string")
    .map(r => ({
      period: r.period,                         // 'YYYY-MM'
      genre: r.genre,
      revenue: Number(r.revenue) || 0,
    }));
    

  if (clean.length === 0) {
    return { periods: [], genres: [], seriesByGenre: {}, rowsUsed: 0 }; 
    //if after filtering the clean array has no elements, we return a dictionary with empty dictionaries/lists.
  }

  // 2) Periodos únicos y ordenados (YYYY-MM ordena bien lexicográficamente)
  //A set saves non-repeated values. It is like an array, but with unique values.

  const periods = Array.from(new Set(clean.map(r => r.period))).sort();
  //new Set(clean.map(r => r.period)) creates a set with all the periods.
  //Array.from(...) converts the set into an array again.
  //.sort() sorts the period array. This works because the dates have the 'YYYY-MM' format

  // 3) Géneros únicos (limit opcional, por si te llegan más de 5)
  const genresAll = Array.from(new Set(clean.map(r => r.genre))); 
  //We do the same with the genres. In this case, there is no need for sorting.
  const genres = genresAll.slice(0, maxGenres);
  //We slice the genres to the number we want

  // 4) Índice de period -> idx para acceso O(1)
  const periodIndex = new Map(periods.map((p, i) => [p, i]));
  //We create an array of arrays with the pair of "period", "index (0, 1, etc.)".
  //this is because map takes as its second argument the index of that element on the list.
  //THIS IS its general form:
  //array.map(function(currentValue, index, arr), thisValue)

  // 5) Inicializar series con ceros
  const seriesByGenre = Object.fromEntries(
    genres.map(g => [g, Array(periods.length).fill(0)])
  );
  /*
    Objects.fromEntries() recieves a list of lists with a pair of values and returns a dictionary.
    Example:
    Object.fromEntries([["Rock", [0,0]], ["Metal", [0,0]]]) = {"Rock": [0,0], "Metal: [0,0]"}
    
    genres.map(g => [g, Array(periods.length).fill(0)]) this creates an array of zeros.
    The amount of zeros is determined by the amount of months measured.
  */

  // 6) Pintar valores existentes (si hay duplicados en el mismo (period,genre), acumulá)
  let rowsUsed = 0;
  for (const r of clean) {
    if (!seriesByGenre[r.genre]) continue; // Ignores genres that are not on the top determined by "maxGenres"
    const i = periodIndex.get(r.period); //gets the index for that month
    if (i == null) continue; //We ignore the row if the index is null or undefined. 

    seriesByGenre[r.genre][i] += r.revenue; 
    // += if there is more than one revenue for a given genre and date, it adds them up to not loose any information
    rowsUsed++;
  }

  return { periods, genres, seriesByGenre, rowsUsed };
}
