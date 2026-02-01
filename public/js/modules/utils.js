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
