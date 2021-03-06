/*
    1. Change accuracy if needed:
    toFixed(4) -> toFixed(needed_decimal_points)
    2. Change functionPlot axis domain to change scale:
    xAxis:{
      domain: [1,1]
    },
    yAxis:{
      domain: [1,1]
    }
*/

let sigm = 1,
  mu = 0,
  N = 0,
  nOfN = 0,
  alfa = 0.2,
  currentN = 0,
  xMin = -8,
  yMin = -0.05,
  xMax = 8,
  yMax = 0.6,
  renderData = [],
  generatedNumbers = [], // [[x1:string,y1:number],[x2:string,y2:number]...[xn:string,yn:number]]
  pointEstimations = [], // [[x1:number],[x2:number]...[xn:number]]
  intervalEstimations = []; // [[x1:number,x2:number],[x1:number,x2:number]...[x1:number,x2:number]]

const nav = {
  sample: document.getElementById("sample"),
  back: document.getElementById("previous"),
  forward: document.getElementById("next"),
  radio: document.getElementsByName("chart"),
  loader: document.getElementsByClassName("loader")[0]
};
let data = {
  screen: {
    width: window.innerWidth,
    height: window.innerHeight
  },
  graphInstance: {},
  sigma: document.getElementById("sigma")["value"],
  mu: document.getElementById("mu")["value"],
  quantity: document.getElementById("quantity")["value"],
  n: document.getElementById("n")["value"],
  alfa: Number(document.getElementById("alfa")["value"]),
  caption: document.getElementById("caption"),
  table: document.getElementsByTagName("table")[0],
  tableDiv: document.getElementById("table"),
  samples: document.getElementById("samples")
};

const chart = document.getElementById("chart");
//==============================CALCULATIONS===============================================>

const probabilityDensity = function(x) {
  return (
    (1 / (sigm * Math.pow(2 * Math.PI, 1 / 2))) *
    Math.exp((-1 * Math.pow(x - mu, 2)) / (2 * Math.pow(sigm, 2)))
  );
};

function gamma(op) {
  // Lanczos Approximation of the Gamma Function
  // As described in Numerical Recipes in C (2nd ed. Cambridge University Press, 1992)
  let z = op + 1;
  let p = [
    1.000000000190015,
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    1.208650973866179e-3,
    -5.395239384953e-6
  ];
  let d1 = Math.sqrt(2 * Math.PI) / z;
  let d2 = p[0];

  for (let i = 1; i <= 6; ++i) d2 += p[i] / (z + i);

  let d3d4 = Math.exp((z + 0.5) * Math.log(z + 5.5) - z - 5.5);

  // console.log("d1 * d2 * d3d4", d1 * d2 * d3d4);

  return d1 * d2 * d3d4;
  // let num = op
  //   const p = [
  //     0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  //     771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  //   ];
  //   let i;
  //   const g = 7;
  //   if (num < 0.5) return Math.PI / (Math.sin(Math.PI * num) * calculus.LanczosGamma(1 - num));
  //   num -= 1;
  //   const a = p[0];
  //   const t = num + g + 0.5;
  //   for (i = 1; i < p.length; i++) {
  //     a += p[i] / (num + i);
  //   }
  //   return Math.sqrt(2 * Math.PI) * Math.pow(t, num + 0.5) * Math.exp(-t) * a;
}

function generate(arr, n) {
  const k = 2.9;
  for (let i = 0; i < n; i++) {
    //random
    arr.push([
      (Math.random() * (-k - k) + k + parseFloat(data.mu)).toFixed(4),
      0
    ]);
  }
  return arr;
}

function getStaticPointEstimates() {
  return generatedNumbers.map(el => {
    const reducer = (sum, current) => sum + +current[0];
    const s = el.reduce(reducer, 0);
    const X = s / el.length;

    return X;
  });
}

function getStaticIntervalEstimates() {
  return generatedNumbers.map((el, i) => getInterval(el, i));
}

function getInterval(arr, i) {
  //Xavg -static point estimate
  const avg = +pointEstimations[i];
  const reducer = (sum, curr) => sum + Math.pow(+curr[0] - avg, 2);

  //Xi - Xavg
  const sqSum = arr.reduce(reducer, 0);
  //S(x) - unshifted variance estimate
  const S = sqSum / (nOfN - 1);
  //T(x)
  const currentAlpfaIndex = alfaArray.indexOf(alfa);
  const t = tArray[nOfN][currentAlpfaIndex];
  // const t =
  //   gamma((nOfN + 1) / 2) /
  //   (Math.sqrt(nOfN * Math.PI) *
  //     gamma(nOfN / 2) *
  //     Math.pow(1 + Math.pow(avg, 2), (nOfN + 1) / 2));

  //students deviation
  const SXt = `${(S * t) / Math.sqrt(nOfN)}`;
  const formattedSXt = normalize(SXt.substring(0, SXt.length - 5));
  let low = avg - formattedSXt;
  let high = avg + formattedSXt;
  // let low = lowPrelim.substring(0, lowPrelim.length - 5);
  // let high = highPrelim.substring(0, highPrelim.length - 5);

  // const numAvg = Number(avg.toFixed(10).substring(0, 10));

  // TEST
  // console.log(
  //   i + 1,
  //   "low",
  //   low,
  //   "high",
  //   high,
  //   "avg",
  //   avg,
  //   "delta",
  //   (S * t) / Math.sqrt(nOfN)
  // );
  // const a = "9872687676423";
  // const b = "9.872687676423";
  // const c = "98.72687676423";
  // const e = "-9872687676423";
  // const d = "-9.872687676423";
  // const f = "-98.72687676423";
  // console.log(
  //   `a ${normalize(a)}`,
  //   `b ${normalize(b)}`,
  //   `c ${normalize(c)}`,
  //   `\nd ${normalize(d)}`,
  //   `e ${normalize(e)}`,
  //   `f ${normalize(f)}`
  // );

  return [low, high];
}

function normalize(el) {
  const isNegative = el[0] === "-";
  const index = el.indexOf(".");
  const isPizdec = index === 2 || index === 3;
  const string = (isNegative && el.slice(1)) || el;

  if ((isNegative && index === 2) || index === 1 || isPizdec) {
    return Number(el);
  } else if (index === -1) {
    const first = string.substring(0, 2);
    const other = string.slice(2);
    return Number(`${(isNegative && "-") || ""}${first}.${other}`);
  } else {
    const arr = string.split(".").join("");
    const first = arr.substring(0, 1);
    const other = arr.slice(1);
    return Number(`${(isNegative && "-") || ""}${first}.${other}`);
  }
}
//===================================CALCULATIONS=============================================<

//=================================DOM_MANIPULATION===========================================>
function handleTableScroll() {
  document.getElementById("tableDiv").scrollLeft = this.scrollLeft;
}

function handlePreviousSample() {
  if (N === 0) return console.log("enter more numbers");

  if (currentN === 0) return console.log("no previous samples");
  currentN--;
  nav.sample.innerHTML = `${currentN + 1}`;
  render();
}

function handleNextSample() {
  if (N === 0) return console.log("enter more numbers");

  if (currentN === N - 1) return console.log("no next samples");
  currentN++;
  nav.sample.innerHTML = `${currentN + 1}`;
  render();
}

function manageGeneration() {
  if (data.sigma === 0) data.sigma = 1;
  if (N === 0) return alert("enter more numbers");
  data.samples.innerHTML = `${N}`;
  //clear generated
  generatedNumbers.length = 0;
  for (let i = 0; i < N; i++) {
    generatedNumbers.push(generate([], data.n));
  }
  fillTable(generatedNumbers);
  //adjust table height
  data.tableDiv.style.height = `${nOfN * 26}px`;
}

function handleGenerate() {
  console.time("generate");
  refreshAll();

  manageGeneration();

  if (data.mu - xMax > 8 && !nav.radio[0]["checked"] === true) {
    refreshCoordinates();
  }
  console.timeEnd("generate");
}

function handleCalculate() {
  console.time("calculate");
  refreshAll();

  pointEstimations = [];
  intervalEstimations = [];
  pointEstimations = getStaticPointEstimates();
  intervalEstimations = getStaticIntervalEstimates();
  fillCalculatedTable(pointEstimations);
  //TEST
  // console.log("intervalEstimations", intervalEstimations);
  // console.log('data.mu - xMax',data.mu - xMax)
  if (!nav.radio[0]["checked"] === true) {
    refreshCoordinates();
  }
  render();

  console.timeEnd("calculate");
}

function refreshAll() {
  refreshTable();
  refreshData();
}
function refreshCoordinates() {
  const reduceX = (max, el) => (max < el[1] ? el[1] : max);
  const max = intervalEstimations.reduce(reduceX, 0);
  xMax = max > data.mu ? max : data.mu;
  // console.log("mu", data.mu, "max", max);
  yMax = data.quantity * 0.1 + 1;
}

function refreshData() {
  data = {
    screen: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    graphInstance: {},
    sigma: document.getElementById("sigma")["value"],
    mu: document.getElementById("mu")["value"],
    quantity: document.getElementById("quantity")["value"],
    n: document.getElementById("n")["value"],
    alfa: Number(document.getElementById("alfa")["value"]),
    caption: document.getElementById("caption"),
    table: document.getElementsByTagName("table")[0],
    tableDiv: document.getElementById("table"),
    samples: document.getElementById("samples")
  };

  nav.sample.innerHTML = 1;
  currentN = 0;
  xMax = 8;
  yMax = 0.6;
  renderData = [];
  N = data.quantity;
  nOfN = data.n;
  sigm = data.sigma;
  mu = data.mu;
  alfa = data.alfa;
}

function refreshTable() {
  if (data.table) data.table.parentNode.removeChild(data.table);
  if (data.tableDiv) data.tableDiv.parentNode.removeChild(data.tableDiv);
  const temp = document.getElementsByTagName("template")[0],
    main = document.getElementsByClassName("main")[0],
    clon = temp.content.cloneNode(true);
  main.appendChild(clon);
}

function refreshChart() {
  if (
    data.graphInstance &&
    data.graphInstance.root &&
    data.graphInstance.root[0] &&
    data.graphInstance.root[0][0]
  ) {
    data.graphInstance.canvas[0][0].innerHTML = "";
    data.graphInstance.root[0][0].innerHTML = "";
  }
  render();
}

function fillTable(arr) {
  if (!arr.length || !arr[0].length) return;
  const outerLength = arr.length;
  const innerLength = arr[0].length;
  const caption = data.caption;

  for (let i = 0; i < outerLength; i++) {
    const tr = data.table.tHead.children[0],
      th = document.createElement("th");
    th.innerHTML = `X${i + 1}`;
    tr.appendChild(th);
  }
  for (let j = 0; j < innerLength; j++) {
    const row = data.table.insertRow(j + 1);
    for (let i = 0; i < outerLength; i++) {
      const cell = row.insertCell(i);
      //array of arrays of arrays of type [x, y = 0]
      cell.innerHTML = arr[i][j][0];
    }
  }

  caption.innerHTML = "Generated numbers";
}

function fillCalculatedTable(arr) {
  if (!arr.length) return;
  const length = arr.length;
  const caption = data.caption;

  for (let i = 0; i < length; i++) {
    const tr = data.table.tHead.children[0],
      th = document.createElement("th");
    th.innerHTML = `X${i + 1}`;
    tr.appendChild(th);
  }

  const row = data.table.insertRow(1);
  for (let i = 0; i < length; i++) {
    const cell = row.insertCell(i);
    cell.innerHTML = arr[i].toFixed(8);
  }

  caption.innerHTML = "Average estimation for each sample";
}

function getIntervalVectors(i, isOne) {
  if (!intervalEstimations.length) {
    nav.radio[0]["checked"] = true;
    return alert("You need to calculate intervals first");
  }
  //TEST
  // console.log(
  //   "pointEstimations",
  //   pointEstimations,
  //   "intervalEstimations",
  //   intervalEstimations
  // );
  let x = pointEstimations[i],
    range = intervalEstimations[i],
    y;
  if (isOne) y = yMax / 2;
  else y = ((yMax - 0.1) / data.quantity) * i;

  const vertical = {
    points: [[x, yMax - 0.05], [x, 0]],
    color: "black",
    fnType: "points",
    graphType: "polyline"
  };
  const data2 = {
    points: [[x, y], [range[0], y], [range[1], y]],
    graphType: "scatter",
    fnType: "points",
    color: "blue",
    sampler: "builtIn"
  };
  const horizontal = {
    points: [[range[0], y], [range[1], y]],
    fnType: "points",
    color: "red",
    graphType: "polyline"
  };
  return [vertical, data2, horizontal];
}

function getData() {
  if (nav.radio[0]["checked"]) {
    const data1 = {
      fn: `(1 / (${sigm} * sqrt(2 * PI))) * exp((-1 * (x-${mu}) ^ 2) / (2 * 1^ 2))`,
      color: "red"
    };
    const data2 = {
      points: generatedNumbers[currentN],
      graphType: "scatter",
      fnType: "points",
      color: "#8134f8"
    };
    if (N === 0 || !generatedNumbers.length) return [data1];
    return [data1, data2];
  } else if (nav.radio[1]["checked"]) {
    return getIntervalVectors(currentN, true);
  } else if (nav.radio[2]["checked"]) {
    const reducer = (sum, current, i) => {
      const el = getIntervalVectors(i);
      el.forEach(item => sum.push(item));

      return sum;
    };
    return pointEstimations.reduce(reducer, []);
  }
}

function handleRadio(target) {
  switch (target.value) {
    case "second":
      refreshCoordinates();
      break;
    case "first":
      refreshCoordinates();
      break;
    default:
      yMax = 0.45;
      xMax = 8;
  }
  refreshChart();
}

function render() {
  //chart width
  const isMobile = data.screen.width < 600;
  const makeWider = xMax + 0.2,
    height = isMobile ? 300 : 450;

  renderData = getData();

  //TEST
  // console.log("renderData", renderData);

  data.graphInstance = functionPlot({
    target: "#chart",
    title: "",
    grid: true,
    height: height,
    width: (!isMobile && height * 1.45) || 350,
    // disableZoom: true,
    xAxis: {
      label: "x",
      domain: [-makeWider, makeWider]
    },
    yAxis: {
      label: "y",
      domain: [-0.05, yMax]
    },
    data: renderData
  });
}

function init() {
  nav.radio[0]["checked"] = true;
  render();
}

function radioListener({ target }) {
  handleRadio(target);
}

nav.radio.forEach(function(el) {
  el.addEventListener("click", radioListener);
});

init();

//=================================DOM_MANIPULATION==============================================<

//=====================================CONSTANTS=================================================<
const alfaArray = [0.8, 0.9, 0.99];
const tArray = {
  1: [3.0777, 6.3137, 63.656],
  2: [1.8856, 2.92, 9.925],
  3: [1.6377, 2.3534, 5.8408],
  4: [1.5332, 2.1318, 4.6041],
  5: [1.4759, 2.015, 4.0321],
  6: [1.4398, 1.9432, 3.7074],
  7: [1.4149, 1.8946, 3.4995],
  8: [1.3968, 1.8595, 3.3554],
  9: [1.383, 1.8331, 3.2498],
  10: [1.3722, 1.8125, 3.1693],
  11: [1.3634, 1.7959, 3.1058],
  12: [1.3562, 1.7823, 3.0545],
  13: [1.3502, 1.7709, 3.0123],
  14: [1.345, 1.7613, 2.9768],
  15: [1.3406, 1.7531, 2.9467],
  16: [1.3368, 1.7459, 2.9208],
  17: [1.3334, 1.7396, 2.8982],
  18: [1.3304, 1.7341, 2.8784],
  19: [1.3277, 1.7291, 2.8609],
  20: [1.3253, 1.7247, 2.8453],
  21: [1.3232, 1.7207, 2.8314],
  22: [1.3212, 1.7171, 2.8188],
  23: [1.3195, 1.7139, 2.8073],
  24: [1.3178, 1.7109, 2.797],
  25: [1.3163, 1.7081, 2.7874]
};
