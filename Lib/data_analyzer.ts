export interface ColumnProfile {
  name: string;
  type: 'numeric' | 'categorical' | 'date';
  nullCount: number;
  uniqueCount: number;
  mean?: number;
  min?: number;
  max?: number;
  sum?: number;
}

export interface DatasetProfile {
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
  suggestedCharts: {
    type: 'bar' | 'line' | 'area';
    xAxis: string;
    yAxis: string;
    title: string;
  }[];
  quickInsights: string[];
}

export function analyzeDataset(rows: Record<string, any>[]): DatasetProfile {
  if (!rows || rows.length === 0) {
    return { rowCount: 0, columnCount: 0, columns: [], suggestedCharts: [], quickInsights: [] };
  }

  const keys = Object.keys(rows[0]);
  const columns: ColumnProfile[] = [];
  const quickInsights: string[] = [];

  for (const key of keys) {
    const rawValues = rows.map(r => r[key]);
    const validValues = rawValues.filter(v => v !== null && v !== undefined && v !== '' && String(v).trim() !== '');
    const isNumeric = validValues.length > 0 && validValues.every(v => !isNaN(Number(v)));

    if (isNumeric) {
      const numVals = validValues.map(Number);
      const sum = numVals.reduce((a, b) => a + b, 0);
      const mean = Number((sum / numVals.length).toFixed(2));
      const min = Math.min(...numVals);
      const max = Math.max(...numVals);

      columns.push({
        name: key,
        type: 'numeric',
        nullCount: rows.length - validValues.length,
        uniqueCount: new Set(numVals).size,
        mean,
        min,
        max,
        sum: Number(sum.toFixed(2))
      });

      quickInsights.push(`Metric '${key}' averages ${mean} (ranging from ${min} to ${max}).`);
    } else {
      columns.push({
        name: key,
        type: 'categorical',
        nullCount: rows.length - validValues.length,
        uniqueCount: new Set(validValues).size
      });
    }
  }

  // Dynamic Chart Recommendations
  const numCols = columns.filter(c => c.type === 'numeric');
  const catCols = columns.filter(c => c.type === 'categorical');
  const suggestedCharts = [];

  if (catCols.length > 0 && numCols.length > 0) {
    suggestedCharts.push({
      type: 'bar' as const,
      xAxis: catCols[0].name,
      yAxis: numCols[0].name,
      title: `${numCols[0].name} Distribution by ${catCols[0].name}`
    });
  }

  if (numCols.length >= 2) {
    suggestedCharts.push({
      type: 'line' as const,
      xAxis: catCols.length > 0 ? catCols[0].name : numCols[0].name,
      yAxis: numCols[1].name,
      title: `${numCols[1].name} Trend Analysis`
    });
  }

  return {
    rowCount: rows.length,
    columnCount: keys.length,
    columns,
    suggestedCharts,
    quickInsights: quickInsights.slice(0, 3)
  };
}