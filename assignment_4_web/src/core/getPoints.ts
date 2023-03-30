import Papa from "papaparse";


export type PointsData = {
  column1: string;
  column2: string;
  minCol1: number;
  maxCol1: number;
  minCol2: number;
  maxCol2: number;
  points: Point[];
}

export type Point = {
  x: number;
  y: number;
  cluster?: number;
};


const getDataset = async (dataset: string) => {
  const raw = await fetch(dataset);
  const data = await raw.text();
  return Papa.parse(data).data as any;
}

const getPoints = (data: any, column1: string, column2: string): PointsData => {
  const index1 = data[0].findIndex((item: string) => item === column1);
  const index2 = data[0].findIndex((item: string) => item === column2);

  const points: Point[] = [];
  let minCol1 = Infinity;
  let maxCol1 = -Infinity;
  let minCol2 = Infinity;
  let maxCol2 = -Infinity;

  for (let i = 1; i < data.length - 1; i++) {
    const row = data[i];
    const x = Number.parseFloat(row[index1]);
    const y = Number.parseFloat(row[index2]);

    minCol1 = Math.min(minCol1, x);
    maxCol1 = Math.max(maxCol1, x);
    minCol2 = Math.min(minCol2, y);
    maxCol2 = Math.max(maxCol2, y);

    points.push({x, y});
  }

  return {
    column1,
    column2,
    minCol1,
    maxCol1,
    minCol2,
    maxCol2,
    points,
  };
}


// Exports
export const getWinePoints = async (column1: string, column2: string) => {
  const data = await getDataset("/data/Wine.csv");
  return getPoints(data, column1, column2);
}

export const getMallCustomersPoints = async (column1: string, column2: string) => {
  const data = await getDataset("/data/Mall_Customers.csv");
  return getPoints(data, column1, column2);
}


export const translate = (w: number, h: number, point: Point, xmin: number, xmax: number, ymin: number, ymax: number, padding: number = 0): Point => {
  const xRange = xmax - xmin;
  const yRange = ymax - ymin;
  const xRatio = (point.x - xmin) / xRange;
  const yRatio = (point.y - ymin) / yRange;
  const x = xRatio * (w - padding * 2) + padding;
  const y = (1 - yRatio) * (h - padding * 2) + padding;
  return {x, y};
}

export const random = (xmin: number, xmax: number, ymin: number, ymax: number): Point => {
  const x = xmin + Math.random() * (xmax - xmin);
  const y = ymin + Math.random() * (ymax - ymin);
  return {x, y};
}

export const distance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx*dx + dy*dy);
};

