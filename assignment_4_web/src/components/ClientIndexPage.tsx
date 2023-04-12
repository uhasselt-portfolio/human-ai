import {signal} from "@preact/signals-react";
import {distance, getMallCustomersPoints, Point, PointsData, random, translate} from "@web/core/getPoints";
import toast from "react-hot-toast";
import {Circle, Group, Layer, Line, Stage, Star, Text} from "react-konva";


const colors = ["#0891b2", "#6d28d9", "#be123c", "#65a30d"];
const colorNames = ["blue", "purple", "red", "green"];

// State
const points = signal<PointsData | null>(null);
const centroids = signal<Point[]>([]);
const showLines = signal<boolean>(false);

const selectedQuestion = signal(0);


const ClientIndexPage = () => {

  // Actions
  // KMeans
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
      setTimeout(() => {
        resolve(true);
      }, timeout);
    });
  }

  const start = async () => {
    const time = 0; // 350

    pickCentroids();
    await sleep(time);
    cluster();
    await sleep(time);
    showClusterLines();
    await sleep(time);

    for (let i = 0; i < 10; i++) {
      updateCentroids();
      await sleep(time);
      cluster();
      await sleep(time);
    }

    toast.success("Done!");
  }

  // Explainer
  const explainPoint = (index: number) => {
    // const point = points.value!.points[index];
    // const centroid = centroids.value[point.cluster!];
    //
    // // round centroid to 2 decimal places
    // centroid.x = Math.round(centroid.x * 100) / 100;
    // centroid.y = Math.round(centroid.y * 100) / 100;
    //
    // toast.success(`Point ${index} is in cluster ${point.cluster} and is closest to centroid ${point.cluster} which is at (${centroid.x}, ${centroid.y})`, {duration: 10000});

    // Step 1. Toggle lines
    showLines.value = false;

    // Step 2. Highlight selected point (index)
    // Unselect all points
    const updatedPoints1: Point[] = points.value!.points.map((point) => {
      return {
        ...point,
        selected: false,
      }
    });

    points.value = {
      ...points.value!,
      points: updatedPoints1,
    }

    // Select point
    const updatedPoints2 = points.value!.points.map((point, i) => {
      if (i === index) {
        return {
          ...point,
          selected: true,
        }
      }

      return point;
    });

    points.value = {
      ...points.value!,
      points: updatedPoints2,
    }

    // Step 3. Show distance between selected point and all other centroids

    // Step 4. Highlight closest centroid

    // Step 5. Show distance between selected point and closest centroid

  }


  // Render
  // Canvas
  const renderDistancesBetweenCentroidsAndSelectedPoint = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    const selectedPoint = points.value?.points.find((point) => point.selected);

    if (!selectedPoint) {
      return null;
    }

    return centroids.value.map((centroid, index) => {
      const {x, y} = translate(w, h, centroid, ...bounds, p);

      // translate selected point
      const {x: x2, y: y2} = translate(w, h, selectedPoint, ...bounds, p);

      // Draw lines between the centroids and the length of the line is the distance between the centroid and the selected point
      // text background color white
      return <Group key={index}>
        <Line points={[x, y, x2, y2]} stroke={"black"} strokeWidth={1} opacity={0.5}/>

        <Text
          key={index + 100}
          x={x - 30} y={y + 10}
          text={distance(selectedPoint, centroid).toFixed(2)}
          fill={"green"}
          stroke={"black"}
          fontSize={20}
          padding={5}
          // background color white
        />
      </Group>
    });
  }

  const renderDataPoints = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    const selectedPoint = points.value?.points.find((point) => point.selected);

    return points.value && points.value.points.map((point: Point, index: number) => {
      const {x, y} = translate(w, h, point, ...bounds, p);
      const color = point.cluster !== undefined ? colors[point.cluster] : "#475569";

      return <Circle
        onClick={() => {
          if (selectedQuestion.value === 0 || selectedQuestion.value === 1) {
            explainPoint(index);
          }

          if (selectedQuestion.value === 2 || selectedQuestion.value === 3) {
            toast.error("Not implemented");
          }
        }}
        key={index}
        x={x} y={y}
        width={10} height={10}
        fill={color}
        opacity={selectedPoint && selectedPoint.cluster !== point.cluster ? 0.5 : 1}
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

      {xTickValues.map((value, index) => {
        const x = ((value - minX) / (maxX - minX)) * (w - p) + p / 2;

        return <Group key={index}>
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
        </Group>
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

      {yTickValues.map((value, index) => {
        const y = ((value - minY) / (maxY - minY)) * (h - p) + p / 2;

        return <Group key={index}>
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
        </Group>
      })}

      <Text
        x={w / 2 - p / 2 + 50}
        y={h - p / 3 + 15}
        text="Age"
      />

    </>
  }

  const renderInfoPanel = () => {
    const selectedPoint = points.value?.points.find((point) => point.selected);

    if (selectedPoint && selectedQuestion.value === 0) {
      const index = points.value?.points.findIndex((point) => point.selected);
      const color = colors[selectedPoint.cluster!];
      const colorName = colorNames[selectedPoint.cluster!];

      const distances = centroids.value.map(centroid => distance(selectedPoint, centroid).toFixed(2));
      const dist = distances[selectedPoint.cluster!];
      const dists = distances.filter(d => d !== dist);

      return <div className="border p-2 rounded absolute top-1 right-1 z-50 w-96">
        <span>The selected datapoint ({index}) belongs to the <span className="font-medium" style={{color: color}}>{colorName}</span> cluster because the distance (<span className="font-medium">{dist}</span>) from the datapoint to the <span className="font-medium" style={{color: color}}>{colorName}</span> clusters centroid is the shorter than the distances (<span className="font-medium">{dists.join(", ")}</span>) to to any other clusters centroids.</span>
      </div>
    }

    if (selectedPoint && selectedQuestion.value === 1) {
      const index = points.value?.points.findIndex((point) => point.selected);
      const color = colors[selectedPoint.cluster!];
      const colorName = colorNames[selectedPoint.cluster!];

      const distances = centroids.value.map(centroid => distance(selectedPoint, centroid).toFixed(2));
      const dist = distances[selectedPoint.cluster!];
      const dists = distances.filter(d => d !== dist);

      return <div className="border p-2 rounded absolute top-1 right-1 z-50 w-96">
        <span>The selected datapoint ({index}) does NOT belong to the any of the remaining clusters. This is because the distances (<span className="font-medium">{dists.join(", ")}</span>) to any of the other clusters is still not smaller than the distance (<span className="font-medium">{dist}</span>) to the <span className="font-medium" style={{color: color}}>{colorName}</span> cluster.</span>
      </div>
    }

    return null;
  }

  const renderCanvas = () => {
    const w = 1200;
    const h = w * 9 / 16;
    const p = 120;

    const bounds: [number, number, number, number] = points.value ? [points.value.minCol1, points.value.maxCol1, points.value.minCol2, points.value.maxCol2] : [0, 0, 0, 0];

    return <div className="relative">
      {renderInfoPanel()}
      <Stage width={w} height={h} className="bg-white border rounded">

        <Layer>
          {renderDataPoints(w, h, bounds, p)}
          {renderCentroids(w, h, bounds, p)}
          {renderLines(w, h, bounds, p)}
          {renderDistancesBetweenCentroidsAndSelectedPoint(w, h, bounds, p)}

          {points.value && renderAxis(w, h, bounds, p)}
        </Layer>
      </Stage>
    </div>
  }

  // Interface
  const renderInterface = () => {
    const btn = "px-2 py-1 rounded bg-gray-900 text-white font-medium w-max";
    const input = "px-2 py-1 rounded border";

    return <div className="flex flex-col gap-1 w-max pt-8">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-1">
          <select className={input} value="mall_customers" onChange={() => {
          }}>
            <option value="mall_customers">Mall Customers</option>
          </select>

          <select className={input} value="age" onChange={() => {
          }}>
            <option value="age">Age</option>
          </select>

          <select className={input} value="annual_income" onChange={() => {
          }}>
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

  const renderExplainer = (id: number, title: string, description: string, test?: boolean) => {
    const selected = id === selectedQuestion.value;

    const clsSelected = selected ? "border-blue-600" : "opacity-60";
    const cls = "border rounded py-3 px-4 w-96 flex flex-col gap-1 cursor-pointer" + " " + clsSelected;

    const onClick = () => {
      selectedQuestion.value = id;

      const updatedPoints1: Point[] = points.value!.points.map((point) => {
        return {
          ...point,
          selected: false,
        }
      });

      points.value = {
        ...points.value!,
        points: updatedPoints1,
      }
    }

    return <div className={cls} onClick={onClick}>
      <span className="font-medium leading-snug">{title}</span>
      <span className="">{description}</span>
    </div>
  }

  const renderExplainers = () => {
    return <div className="flex flex-col gap-1 mt-[69px]">
      {renderExplainer(
        0,
        "Why is this datapoint (dot) assigned to the resulting cluster?",
        "Select a datapoint to get more information about why the datapoint is assigned to the resulting cluster.",
        true,
      )}

      {renderExplainer(
        1,
        "Why is this datapoint (dot) NOT assigned to the resulting cluster?",
        "Select a datapoint to get more information about why the datapoint is NOT assigned to any of the other clusters.",
      )}

      {renderExplainer(
        2,
        "When does clustering work well? Does it work well in this case?",
        "This will visualize the initial centroids and visualize how the clusters are formed from there, we will see that if the centroids are spread out that the result will be better, we will also see that the clusters contain approx. the same number of datapoints.",
      )}

      {renderExplainer(
        3,
        "How do you correct for bad predictions?",
        "Explain here how we can correct!",
      )}
    </div>
  }

  const render = () => {

    return <div className="flex flex-row gap-2 mx-auto w-max">
      {renderInterface()}
      {renderExplainers()}
    </div>
  }

  return render();
};

export default ClientIndexPage;
