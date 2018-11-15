
function showBarChart(data) {

  // Use the margin convention practice
  var margin = {top: 50, right: 50, bottom: 50, left: 50}
    , width = window.innerWidth - margin.left - margin.right // Use the window's width
    , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

  if (width>1000)
    width = 1000;
  var numDataPoints = width/2;
  var zeroYLevel = margin.bottom;
  var zeroXLevel = margin.right;
  var maxYVariation = height-10;
  // Limit the dataset
  var trimmedData = data.slice(data.length-numDataPoints, data.length);
  console.log("trimmedData.length:", trimmedData.length);
  console.log("width:", width);
  console.log("numDataPoints:", numDataPoints);
  console.log("height:", height);
  console.log("maxYVariation:", maxYVariation);
  // CSV data from D3 loads as string.  Convert to numbers.
  makeFieldNumerical(trimmedData, "Price");
  makeFieldNumerical(trimmedData, "Transaction Count");
  const maxPrice = getMaxValue(trimmedData, "Num Price");
  const priceScaleFactor = maxYVariation / maxPrice;
  const maxTrans = getMaxValue(trimmedData, "Num Transaction Count");
  const transScaleFactor = maxYVariation / maxTrans;
  // Create the D3 rendering for the data
  var chart = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
  var bar = chart.selectAll("g")
            .data(trimmedData)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
              //console.log("translate(" + i + ", 0 )");
              // Each rectangle for the data is created touching the y-axis.
              // This translation shifts them by variable amounts spreading across the page.
              return "translate(" + 2*i + ", 0 )";
            });
  // Append tall thin rectangles for the transaction volume data
  bar.append("rect")
      .attr("width", 1)
      .attr("height", function(d){
        return(d["Num Transaction Count"] * transScaleFactor )
      })
      .attr("x", zeroXLevel ) // Ensures the first rectangle is touching to y-axis
      .attr("y", function(d){
//        return(height - zeroYLevel - d["Scaled Transaction Count"] - d["Scaled Price"])
        return(height - zeroYLevel - d["Num Transaction Count"] * transScaleFactor)
      })
      .attr("fill", "steelblue");
  // Append small squares for the pricing data
  bar.append("rect")
      .attr("width", 2)
      .attr("height", 2)
      .attr("x", zeroXLevel )
      .attr("y", function(d){
        console.log( d["Date(UTC)"], d["Num Price"] );
        return( height - zeroYLevel - d["Num Price"] * priceScaleFactor )
      })
      .attr("fill", "black");

  // Create the xAxis on the bottom of the chart
  var xScale = d3.scaleLinear()
    .domain([0,numDataPoints-1])  // Domain of possible values on the X Axis
    .range([0,width]);  // Range of possible values this domain will map to
  var xAxis = d3.axisBottom().scale(xScale);
  var axisGroup = chart.append("g")
    .attr("transform", "translate(" + zeroXLevel + "," + (height - zeroYLevel) + ")")
    .call(xAxis);

  // Create a yAxis on the left for the transaction data scale
  var yScale = d3.scaleLinear()
      .domain([0, maxPrice]) // input
      .range([height-zeroXLevel, 0]); // output
  chart.append("g")
      .attr("transform", "translate(50,0)")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  // Add a line chart for the pricing data
  // X scale will use the index of our data
  var xScaleLine = d3.scaleLinear()
      .domain([0, numDataPoints-1]) // input
      .range([0, width]); // output

  // Y scale for line chart
  var yScaleLine = d3.scaleLinear()
      .domain([0, maxPrice]) // input
      .range([height, 0]); // output

  // d3's line generator
  var line = d3.line()
      .x(function(d, i) { return(xScaleLine(i) + zeroXLevel); }) // set the x values for the line generator
      .y(function(d) {
        console.log( d["Date(UTC)"], d["Num Price"] );
        return yScaleLine(d["Num Price"] + zeroYLevel);
      }) // set the y values for the line generator
      .curve(d3.curveMonotoneX) // apply smoothing to the line
  // Append the path, bind the data, and call the line generator
  chart.append("path")
      .datum(trimmedData) // Binds data to the line
      .attr("class", "line") // Assign a class for styling
      .attr("d", line); // 11. Calls the line generator

  // Appends a circle for each datapoint
  chart.selectAll(".dot")
      .data(trimmedData)
      .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d, i) { return(xScaleLine(i) + zeroXLevel); })
      .attr("cy", function(d) {
        return yScaleLine(d["Num Price"] + zeroYLevel);
      })
      .attr("r", 5)
        .on("mouseover", function(a, b, c) {
    			console.log(a)
          // this.attr('class', 'focus')
  		})
      .on("mouseout", function() {  })

}

function scaleData(data, field, scaleTo) {

  var allValues = data.map(item => {
      return(1*item[field]);
  });
  var maxValue = Math.max(...allValues);
  console.log("Scaling to maxValue:", maxValue);
  // var scaledAry = transCounts.map(item => {
  //   console.log(item);
  //     return( (scaleTo * item) / maxValue);
  // });
  return( data.map(item => {
    item["Scaled " + field] = (scaleTo * item[field]) / maxValue;
    return(item);
  }))
}

function getMaxValue(data, field) {

  var allValues = data.map(item => {
      return(1*item[field]);
  });
  return(Math.max(...allValues));
}

function makeFieldNumerical(data, field) {

  return( data.map(item => {
    item["Num " + field] = (1.0*item[field]);
    return(item);
  }));
}


function renderLineChart(data) {

  // Use the margin convention practice
  var margin = {top: 50, right: 50, bottom: 50, left: 50}
    , width = window.innerWidth - margin.left - margin.right // Use the window's width
    , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

  // The number of datapoints
  var numDataPoints = width/2;
  // Limit the dataset
  var trimmedData = data.slice(data.length-numDataPoints, data.length);
  var numericData = trimmedData.map(item => {
    item["Num Price"] = (1.0*item["Price"]);
    return(item);
  });
  var allPrices =  trimmedData.map(item => {
      return( 1*item["Num Price"]);
  });
  var maxPrice = Math.max(...allPrices);
  console.log("maxPrice:", maxPrice)

  // Convert to an array that D3 can use
  var d3Data =  trimmedData.map(item => {
      return( { "y": 1*item["Num Price"] } );
  });

  // X scale will use the index of our data
  var xScale = d3.scaleLinear()
      .domain([0, numDataPoints-1]) // input
      .range([0, width]); // output

  // Y scale will use the randomly generate number
  var yScale = d3.scaleLinear()
      .domain([0, maxPrice]) // input
      .range([height, 0]); // output

  // d3's line generator
  var line = d3.line()
      .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
      .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
      .curve(d3.curveMonotoneX) // apply smoothing to the line

  // Add the SVG to the page and employ #2
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Call the x axis in a group tag
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // Call the y axis in a group tag
  svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  // Append the path, bind the data, and call the line generator
  svg.append("path")
      .datum(d3Data) // 10. Binds data to the line
      .attr("class", "line") // Assign a class for styling
      .attr("d", line); // 11. Calls the line generator

  // Appends a circle for each datapoint
  svg.selectAll(".dot")
      .data(d3Data)
    .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d, i) { return xScale(i) })
      .attr("cy", function(d) { return yScale(d.y) })
      .attr("r", 5)
        .on("mouseover", function(a, b, c) {
    			console.log(a)
          // this.attr('class', 'focus')
  		})
        .on("mouseout", function() {  })
}
