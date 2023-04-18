import {signal} from "@preact/signals-react";
import {distance, getMallCustomersPoints, Point, PointsData, random, translate} from "@web/core/getPoints";
import toast from "react-hot-toast";
import {Circle, Group, Layer, Line, Stage, Star, Text} from "react-konva";


const colors = ["#0891b2", "#6d28d9", "#be123c", "#65a30d"];
const colorNames = ["blue", "purple", "red", "green"];

// State
const points = signal<PointsData | null>(null);
const centroids = signal<Point[]>([]);
const initialCentroids = signal<Point[]>([]);
const showLines = signal<boolean>(false);

// Selection
const selectedQuestion = signal<number | undefined>(undefined);
const selectedDatapoint = signal<number | undefined>(undefined);
const selectedCluster = signal<number | undefined>(undefined);

// Constants
const numClusters = 4;


const ClientIndexPage = () => {

  // KMeans
  const loadPoints = async () => {
    points.value = await getMallCustomersPoints("Age", "Annual Income (k$)");
  }

  const pickCentroids = () => {
    const n = numClusters;

    const {minCol1, maxCol1, minCol2, maxCol2} = points.value!;
    const randPoints: Point[] = [];

    for (let i = 0; i < n; i++) {
      const point = random(minCol1, maxCol1, minCol2, maxCol2);
      randPoints.push(point);
    }

    centroids.value = randPoints;
    initialCentroids.value = randPoints;
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
    showLines.value = true;
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

  // Selection
  const selectDatapoint = (index: number | undefined) => {
    selectedDatapoint.value = index;
    index && toast.success("Selected Datapoint");
  }

  const selectCentroid = (index: number | undefined) => {
    selectedCluster.value = index;
    index && toast.success("Selected Centroid");
  }

  const getSelectedDatapoint = () => {
    return points.value?.points![selectedDatapoint.value!]!;
  }

  const getSelectedCentroid = () => {
    return centroids.value![selectedCluster.value!];
  }

  // Actions
  const include = () => {
    const iCentroid = selectedCluster.value;
    const iDatapoint = selectedDatapoint.value;

    const point = points.value!.points[iDatapoint!]!;
    const cluster2 = point.cluster!;

    // while (iCentroid !== cluster2) {
    for (let i = 0; i < 100; i++) {

      if (iCentroid === cluster2) {
        break;
      }

      centroids.value = centroids.value.map((centroid, index) => {

        if (index === iCentroid) {
          const dx = centroid.x - ((centroid.x - point.x) / 100);
          const dy = centroid.y - ((centroid.y - point.y) / 100);
          return {x: dx, y: dy};
        }

        return centroid;
      });

      cluster();
    }
  }


  // Render
  // Canvas
  const renderAllDistances = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    if (selectedDatapoint.value === undefined) {
      return null;
    }

    if (!(selectedQuestion.value === 0 || selectedQuestion.value === 1)) {
      return null;
    }

    const point = getSelectedDatapoint();

    return centroids.value.map((centroid, index) => {
      const {x, y} = translate(w, h, centroid, ...bounds, p);

      // translate selected point
      const {x: x2, y: y2} = translate(w, h, point, ...bounds, p);

      // Draw lines between the centroids and the length of the line is the distance between the centroid and the selected point
      // text background color white
      return <Group key={index}>
        <Line points={[x, y, x2, y2]} stroke={"black"} strokeWidth={1} opacity={0.5}/>

        <Text
          key={index + 100}
          x={x - 30} y={y + 10}
          text={distance(point, centroid).toFixed(2)}
          fill={"green"}
          stroke={"black"}
          fontSize={20}
          padding={5}
          // background color white
        />
      </Group>
    });
  }

  const renderDatapoints = (w: number, h: number, bounds: [number, number, number, number], p: number) => {

    return points.value && points.value.points.map((point: Point, index: number) => {
      const {x, y} = translate(w, h, point, ...bounds, p);

      const color1 = point.cluster !== undefined ? colors[point.cluster] : "#475569";
      const color = selectedDatapoint.value === index ? "black" : color1;

      const whenDoesClusteringWorkWellSelected = selectedQuestion.value === 2 || selectedQuestion.value === 3;
      const opacity1 = selectedDatapoint.value !== undefined && getSelectedDatapoint().cluster !== point.cluster ? 0.5 : 1;
      const opacity = whenDoesClusteringWorkWellSelected ? 0.2 : opacity1;

      const onClick = () => {
        selectDatapoint(index);
      }

      return <Circle
        onClick={onClick}
        key={index}
        x={x} y={y}
        width={10} height={10}
        fill={color}
        opacity={opacity}
      />
    });
  }

  const renderCentroids = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    return points.value && centroids.value.map((point: Point, index: number) => {
      const {x, y} = translate(w, h, point, ...bounds, p);

      const color = selectedCluster.value === index ? "black" : colors[index];

      const whenDoesClusteringWorkWellSelected = selectedQuestion.value === 2 || selectedQuestion.value === 3;
      const opacity = whenDoesClusteringWorkWellSelected ? 0.2 : 1;

      const onClick = () => {
        selectCentroid(index);
      }

      return <Star
        onClick={onClick}
        key={index + 200}
        x={x} y={y}
        width={10} height={10}
        innerRadius={10} outerRadius={5}
        numPoints={4}
        fill={color}
        opacity={opacity}
      />
    })
  }

  const renderInitialCentroids = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    return points.value && initialCentroids.value.map((point: Point, index: number) => {
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

  const renderInitialCentroidsOnAxis = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    return points.value && initialCentroids.value.map((point: Point, index: number) => {
      const {x, y} = translate(w, h, point, ...bounds, p);
      const size = 4;

      return <Group>
        <Circle
          key={index + 200}
          x={p / 2}
          y={y}
          width={size}
          height={size}
          radius={size}
          fill={colors[index]}
        />
        <Circle
          key={index + 200}
          x={x}
          y={h - p / 2}
          width={size}
          height={size}
          radius={size}
          fill={colors[index]}
        />
      </Group>
    })
  }

  const renderLines = (w: number, h: number, bounds: [number, number, number, number], p: number) => {
    return showLines.value && points.value!.points.map((point: Point, index: number) => {
      const point2 = centroids.value[point.cluster!];

      const {x, y} = translate(w, h, point, ...bounds, p);
      const {x: x2, y: y2} = translate(w, h, point2, ...bounds, p);

      const whenDoesClusteringWorkWellSelected =
        (selectedDatapoint.value !== undefined && selectedQuestion.value === 0) ||
        selectedQuestion.value === 2 ||
        selectedQuestion.value === 3;

      const opacity = whenDoesClusteringWorkWellSelected ? 0.2 : 1;

      return <Line
        key={index + 210}
        points={[x, y, x2, y2]}
        strokeWidth={1}
        stroke={colors[point.cluster!]}
        opacity={opacity}
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

  const renderCanvas = () => {
    const w = 1200;
    const h = w * 9 / 16;
    const p = 120;

    const bounds: [number, number, number, number] = points.value ? [points.value.minCol1, points.value.maxCol1, points.value.minCol2, points.value.maxCol2] : [0, 0, 0, 0];
    const whenDoesClusteringWorkWellSelected = selectedQuestion.value === 2 || selectedQuestion.value === 3;

    return <div className="relative">
      {renderInfoPanel()}
      <Stage width={w} height={h} className="bg-white border rounded">

        <Layer>
          {renderLines(w, h, bounds, p)}
          {renderCentroids(w, h, bounds, p)}
          {renderDatapoints(w, h, bounds, p)}

          {renderAllDistances(w, h, bounds, p)}
          {whenDoesClusteringWorkWellSelected && renderInitialCentroids(w, h, bounds, p)}
          {points.value && renderAxis(w, h, bounds, p)}

          {whenDoesClusteringWorkWellSelected && renderInitialCentroidsOnAxis(w, h, bounds, p)}
        </Layer>
      </Stage>
    </div>
  }

  // Explanation
  const renderInfoPanel = () => {
    const clsContainer = "border rounded p-2 absolute top-1 right-1 z-50 w-96 bg-white flex flex-col gap-1";

    // Why is this datapoint (dot) assigned to the resulting cluster?
    if (selectedDatapoint.value !== undefined && selectedQuestion.value === 0) {
      const point = getSelectedDatapoint();

      const index = selectedDatapoint.value;
      const color = colors[point.cluster!];
      const colorName = colorNames[point.cluster!];

      const distances = centroids.value.map(centroid => distance(point, centroid).toFixed(2));
      const dist = distances[point.cluster!];
      const dists = distances.filter(d => d !== dist);

      return <div className={clsContainer}>
        <span>The selected datapoint ({index}) belongs to the <span className="font-medium" style={{color: color}}>{colorName} </span>
          cluster because the distance (<span className="font-medium">{dist}</span>) from the datapoint to the
          <span className="font-medium" style={{color: color}}> {colorName}</span> clusters centroid is the shorter than the distances
          (<span className="font-medium">{dists.join(", ")}</span>) to to any other clusters centroids.</span>
      </div>
    }

    if (selectedDatapoint.value === undefined && selectedQuestion.value === 0) {
      return <div className={clsContainer}>
        <span>Select a <b>datapoint</b>.</span>
      </div>
    }

    // Why is this datapoint (dot) NOT assigned to the resulting cluster?
    if ((selectedDatapoint.value !== undefined && selectedCluster.value !== undefined) && selectedQuestion.value === 1) {
      const point = getSelectedDatapoint();
      const centroid = getSelectedCentroid();

      const index = selectedDatapoint.value;
      const color = colors[point!.cluster!];
      const colorName = colorNames[point!.cluster!];

      const distances = centroids.value.map(centroid => distance(point!, centroid).toFixed(2));
      const dist = distances[point!.cluster!];
      const dists = distances.filter(d => d !== dist);

      return <div className={clsContainer}>
        <span>The selected datapoint ({index}) does NOT belong to the any of the remaining clusters. This is because the distances (<span
          className="font-medium">{dists.join(", ")}</span>) to any of the other clusters is still not smaller than the distance (<span
          className="font-medium">{dist}</span>) to the <span className="font-medium"
                                                              style={{color: color}}>{colorName}</span> cluster.</span>
      </div>
    }

    if (!(selectedDatapoint.value !== undefined && selectedCluster.value !== undefined) && selectedQuestion.value === 1) {
      return <div className={clsContainer}>
        <span>Select a <b>datapoint</b> and <b>centroid</b>.</span>
      </div>
    }

    // When does clustering work well?
    if (selectedQuestion.value === 2) {
      const ppc = centroids.value.map((centroid, index) => {
        return points.value!.points.filter((v) => v.cluster === index).length;
      });

      return <div className={clsContainer}>
        <span>Clustering works well if the initial centroids are spread evenly. Not close ot each other, but close to a lot of points. The centroids are visualized. We can also verify that the number of initial centroids equals the number of final clusters.</span>
      </div>
    }

    // Does it work well in this case?
    if (selectedQuestion.value === 3) {
      const ppc = centroids.value.map((centroid, index) => {
        return points.value!.points.filter((v) => v.cluster === index).length;
      });

      const found: any[] = [];
      points.value?.points!.forEach((point) => {
        if (!found.includes(point.cluster)) {
          found.push(point.cluster);
        }
      });

      return <div className={clsContainer}>
        <span> The number of datapoints per cluster are as follows, {ppc.slice(0, ppc.length - 1).map((value, index) => {
          const color = colors[index];
          const colorName = colorNames[index];

          return <span><span className="font-medium" style={{color}}>{value}</span> for the <span
            className="font-medium" style={{color}}>{colorName}</span> cluster, </span>
        })}{ppc.slice(ppc.length - 1).map((value, index) => {
          const color = colors[index + ppc.length - 1];
          const colorName = colorNames[index + ppc.length - 1];

          return <span> and <span className="font-medium" style={{color}}>{value}</span> for the <span
            className="font-medium" style={{color}}>{colorName}</span> cluster.</span>
        })}</span>
        <span>We started with <span className="font-medium">{numClusters}</span> centroids and we finished with <span
          className="font-medium">{found.length}</span> final clusters. This shows us that {numClusters === found.length ? "no clusters where lost." : `we ended up with only ${found.length} clusters.`}</span>
      </div>
    }

    // How do you correct for bad predictions?
    if ((selectedDatapoint.value !== undefined && selectedCluster.value !== undefined) && selectedQuestion.value === 4) {
      return <div className={clsContainer}>
        <button className="px-2 py-1 rounded bg-black w-max h-max text-white" onClick={include}>Include</button>
        <span>This will include the selected datapoint into the selected cluster, as a side affect, other datapoints may also end up in a different cluster.</span>
      </div>
    }

    if (!(selectedDatapoint.value !== undefined && selectedCluster.value !== undefined) && selectedQuestion.value === 4) {
      return <div className={clsContainer}>
        <span>Select a <b>datapoint</b> and <b>centroid</b>.</span>
      </div>
    }

    return null;
  }

  const renderExplainer = (id: number, title: string, description: string, test?: boolean) => {
    const selected = id === selectedQuestion.value;

    const clsSelected = selected ? "border-blue-600" : "opacity-60";
    const cls = "border rounded py-3 px-4 w-96 flex flex-col gap-1 cursor-pointer" + " " + clsSelected;

    const clean = () => {
      selectDatapoint(undefined);
      selectCentroid(undefined);
    }

    const onClick = () => {
      if (selectedQuestion.value === id) {
        selectedQuestion.value = undefined;
        clean();
        return;
      }

      selectedQuestion.value = id;

      if (id >= 2) {
        showLines.value = true;
      }

      clean();
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
        "When does clustering work well?",
        "This will visual the initial centroids. And show you the end result to show you that if the initial centroids are chosen well, the clustering likely works well.",
      )}

      {renderExplainer(
        3,
        "Does it work well in this case?",
        "It works in this case if there are 4 centroids, and the centroids evenly distributed or highly coupled",
      )}

      {renderExplainer(
        4,
        "How do you correct for bad predictions?",
        "Select a cluster an a datapoint you want to correct, this will then move the centroid of the cluster towards the datapoint until the datapoint is part of the cluster. Keep in mind that this may also result in other datapoint, added to the cluster.",
      )}
    </div>
  }

  // Interface
  const renderInputAndStart = () => {
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

  const render = () => {

    return <div className="flex flex-row gap-2 mx-auto w-max">
      {renderInputAndStart()}
      {renderExplainers()}
    </div>
  }

  return render();
};

export default ClientIndexPage;
