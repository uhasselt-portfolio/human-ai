import {distance, getMallCustomersPoints, Point, PointsData, random, translate} from "@web/core/getPoints";
import {useState} from "react";
import {Circle, Layer, Line, Stage, Star} from "react-konva";


const colors = ["#0891b2", "#6d28d9", "#be123c", "#65a30d"];


const ClientIndexPage = () => {

  // State
  const [points, setPoints] = useState<PointsData | null>(null);
  const [centroids, setCentroids] = useState<Point[]>([]);
  const [showLines, setShowLines] = useState<boolean>(false);


  // Actions
  const loadPoints = async () => {
    const points = await getMallCustomersPoints("Age", "Annual Income (k$)");
    setPoints(points);
  }

  const pickCentroids = () => {
    const n = 4;

    const {minCol1, maxCol1, minCol2, maxCol2} = points!;
    const randPoints: Point[] = [];

    for (let i = 0; i < n; i++) {
      const point = random(minCol1, maxCol1, minCol2, maxCol2);
      randPoints.push(point);
    }

    setCentroids(randPoints);
  }

  const cluster = () => {

    const updatedPoints: Point[] = points!.points.map((point) => {
      let min = Infinity;
      let index = 0;

      centroids.forEach((centroid, i) => {
        const d = distance(point, centroid);
        min = Math.min(min, d);

        if (min === d) {
          index = i;
        }
      });

      return {
        ...point,
        cluster: index,
      }
    });

    const up = {
      ...points!,
      points: updatedPoints,
    };

    setPoints(up);
  }

  const showClusterLines = () => {
    setShowLines(true);
  }

  const updateCentroids = () => {
    const updatedCentroids: Point[] = centroids.map((centroid, index) => {
      let x = 0;
      let y = 0;
      let count = 0;

      points!.points.forEach((point) => {
        if (point.cluster === index) {
          x += point.x;
          y += point.y;
          count += 1;
        }
      });

      return {
        x: x / count,
        y: y / count,
      };
    });

    setCentroids(updatedCentroids);
  }

  const start = () => {
    // 1. Load points
    // 2. Randomly pick centroids
    // 3. Step (select closest point to centroid)
    // 4. Visualize lines
    // 5. Update centroid + lines + color
    // 6. Repeat 3.
  }

  // Render
  const renderDataPoints = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    return points && points.points.map((point: Point, index: number) => {
      const {x, y} = translate(w, h, point, ...bounds, p);
      const color = point.cluster !== undefined ? colors[point.cluster] : "#475569";

      return <Circle
        key={index}
        x={x} y={y}
        width={10} height={10}
        fill={color}
      />
    });
  }

  const renderCentroids = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    return points && centroids.map((point: Point, index: number) => {
      const {x, y} = translate(w, h, point, ...bounds, p);
      return <Star
        key={index + 200}
        x={x} y={y}
        width={10} height={10}
        innerRadius={10} outerRadius={5}
        numPoints={4} fill={colors[index]}
      />
    })
  }

  const renderLines = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    return showLines && points!.points.map((point: Point, index: number) => {
      const point2 = centroids[point.cluster!];

      const {x, y} = translate(w, h, point, ...bounds, p);
      const {x: x2, y: y2} = translate(w, h, point2, ...bounds, p);

      return <Line
        key={index + 210}
        points={[x, y, x2, y2]}
        strokeWidth={1}
        stroke={colors[point.cluster!]}
      />
    })
  }

  const renderCanvas = () => {
    const w = 1200;
    const h = w * 9 / 16;
    const p = 40;

    const bounds: [number, number, number, number] = points ? [points.minCol1, points.maxCol1, points.minCol2, points.maxCol2] : [0, 0, 0, 0];

    return <Stage width={w} height={h} className="bg-white border-2">
      <Layer>
        {renderDataPoints(w, h, bounds, p)}
        {renderCentroids(w, h, bounds, p)}
        {renderLines(w, h, bounds, p)}
      </Layer>
    </Stage>
  }

  const render = () => {
    const btn = "px-2 py-1 rounded bg-gray-900 text-white font-medium w-max";

    return <div className="flex flex-col gap-1 w-max mx-auto pt-8">
      {renderCanvas()}

      <div className="flex flex-row gap-1">
        <button className={btn} onClick={loadPoints}>Load</button>
        <button className={btn} onClick={pickCentroids}>Initial Centroids</button>
        <button className={btn} onClick={cluster}>Cluster</button>
        <button className={btn} onClick={showClusterLines}>Lines</button>
        <button className={btn} onClick={updateCentroids}>Update Centroids</button>

        <button className={btn} onClick={start}>Start</button>
      </div>
    </div>;
  }

  return render();
};

export default ClientIndexPage;
