import {signal} from "@preact/signals-react";
import {distance, getMallCustomersPoints, Point, PointsData, random, translate} from "@web/core/getPoints";
import {Circle, Layer, Line, Stage, Star, Text} from "react-konva";


const colors = ["#0891b2", "#6d28d9", "#be123c", "#65a30d"];

// State
const points = signal<PointsData | null>(null);
const centroids = signal<Point[]>([]);
const showLines = signal<boolean>(false);


const ClientIndexPage = () => {


  // Actions
  const loadPoints = async () => {
    points.value = await getMallCustomersPoints("Age", "Annual Income (k$)");
  }

  const pickCentroids = () => {
    const n = 4;

    const {minCol1, maxCol1, minCol2, maxCol2} = points.value!;
    const randPoints: Point[] = [];

    for (let i = 0; i < n; i++) {
      const point = random(minCol1, maxCol1, minCol2, maxCol2);
      randPoints.push(point);
    }

    centroids.value = randPoints;
  }

  const cluster = () => {

    const updatedPoints: Point[] = points.value!.points.map((point) => {
      let min = Infinity;
      let index = 0;

      centroids.value.forEach((centroid, i) => {
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

    points.value = {
      ...points.value!,
      points: updatedPoints,
    };
  }

  const showClusterLines = () => {
    showLines.value = !showLines.value;
  }

  const updateCentroids = () => {
    centroids.value = centroids.value.map((centroid, index) => {
      let x = 0;
      let y = 0;
      let count = 0;

      points.value!.points.forEach((point) => {
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
  }

  const sleep = async (timeout: number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { resolve(true); }, timeout);
    });
  }

  const start = async () => {
    const time = 350;

    pickCentroids();
    await sleep(time);
    cluster();
    await sleep(time);
    showClusterLines();
    await sleep(time);

    for (let i = 0; i < 20; i++) {
      updateCentroids();
      await sleep(time);
      cluster();
      await sleep(time);
    }

    // 2. Randomly pick centroids
    // 3. Step (select closest point to centroid)
    // 4. Visualize lines
    // 5. Update centroid + lines + color
    // 6. Repeat 3.
  }


  // Render
  const renderDataPoints = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    return points.value && points.value.points.map((point: Point, index: number) => {
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
    return points.value && centroids.value.map((point: Point, index: number) => {
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
    return showLines.value && points.value!.points.map((point: Point, index: number) => {
      const point2 = centroids.value[point.cluster!];

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

  const renderAxis = (w: number, h: number, bounds: [number, number, number, number], p: number) => {

    const [minX, maxX, minY, maxY] = bounds;

    const xTickValues = [minX, minX + (maxX - minX) / 4, minX + (maxX - minX) / 2, minX + (maxX - minX) * 3 / 4, maxX];
    const yTickValues = [minY, minY + (maxY - minY) / 4, minY + (maxY - minY) / 2, minY + (maxY - minY) * 3 / 4, maxY];

    const xTickLength = 5;
    const yTickLength = 5;

    return <>
      {/* X Axis*/}
      <Line
        points={[p / 2, h - p / 2, w - p / 2, h - p / 2]}
        strokeWidth={1}
        stroke={"black"}
      />

      {xTickValues.map((value) => {
        const x = ((value - minX) / (maxX - minX)) * (w - p) + p / 2;

        return (
          <>
            <Line
              points={[x, h - p / 2, x, h - p / 2 + xTickLength]}
              strokeWidth={1}
              stroke={"black"}
            />
            <Text
              x={x - 7}
              y={h - p / 2 + xTickLength + 5}
              text={value.toString()}
              align="center"
              verticalAlign="top"
              fontSize={14}
            />
          </>
        );
      })}

      <Text
        x={p / 5 - 17}
        y={h / 2 + 50}
        rotation={-90}
        text="Annual Income (k$)"
      />

      {/* Y Axis  */}
      <Line
        points={[p / 2, p / 2, p / 2, h - p / 2]}
        strokeWidth={1}
        stroke={"black"}
      />

      {yTickValues.map((value) => {
        const y = ((value - minY) / (maxY - minY)) * (h - p) + p / 2;

        return (
          <>
            <Line
              points={[p / 2, h - y, p / 2 - yTickLength, h - y]}
              strokeWidth={1}
              stroke={"black"}
            />
            <Text
              x={p / 2 - yTickLength - 5 - 25}
              y={h - y - 5}
              text={value.toString()}
              align="left"
              verticalAlign="left"
              fontSize={14}
            />
          </>
        );
      })}

      <Text
        x={w / 2 - p / 2 + 50}
        y={h - p / 3 + 15}
        text="Age"
      />

    </>
  }

  const renderCanvas = () => {
    const w = 1200;
    const h = w * 9 / 16;
    const p = 120;

    const bounds: [number, number, number, number] = points.value ? [points.value.minCol1, points.value.maxCol1, points.value.minCol2, points.value.maxCol2] : [0, 0, 0, 0];

    return <Stage width={w} height={h} className="bg-white border-2">
      <Layer>
        {renderDataPoints(w, h, bounds, p)}
        {renderCentroids(w, h, bounds, p)}
        {renderLines(w, h, bounds, p)}

        {points.value && renderAxis(w, h, bounds, p)}
      </Layer>
    </Stage>
  }

  const render = () => {
    const btn = "px-2 py-1 rounded bg-gray-900 text-white font-medium w-max";
    const input = "px-2 py-1 rounded border";

    return <div className="flex flex-col gap-1 w-max mx-auto pt-8">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-1">
          <select className={input} value="mall_customers">
            <option value="mall_customers">Mall Customers</option>
          </select>

          <select className={input} value="age">
            <option value="age">Age</option>
          </select>

          <select className={input} value="annual_income">
            <option value="annual_income">Annual Income (k$)</option>
          </select>

          <button className={btn} onClick={loadPoints}>Load</button>
        </div>

        <div className="flex flex-row gap-1">
          {/*<button className={btn} onClick={loadPoints}>Load</button>*/}
          {/*<button className={btn} onClick={pickCentroids}>Initial Centroids</button>*/}
          {/*<button className={btn} onClick={cluster}>Cluster</button>*/}
          {/*<button className={btn} onClick={showClusterLines}>Lines</button>*/}
          {/*<button className={btn} onClick={updateCentroids}>Update Centroids</button>*/}

          <button className={btn} onClick={start}>Start</button>
        </div>
      </div>

      {renderCanvas()}

    </div>;
  }

  return render();
};

export default ClientIndexPage;
