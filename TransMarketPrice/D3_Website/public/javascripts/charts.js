
function showBarChart(data, x, y, width, height) {

  // Retain only the 500 most recent price and transaction volume data.
  var numDataPoints = 500;
  var zeroYLevel = 50;
  var zeroXLevel = 50;
  var maxYVariation = 700;
  data.splice(0, numDataPoints-1);
  // CSV data from D3 loads as string.  Convert to numbers.
  makeFieldNumerical(data, "Price");
  makeFieldNumerical(data, "Transaction Count");
  const maxPrice = getMaxValue(data, "Num Price");
  const priceScaleFactor = maxYVariation / maxPrice;
  const maxTrans = getMaxValue(data, "Num Transaction Count");
  const transScaleFactor = maxYVariation / maxTrans;
  // Create the D3 rendering for the data
  var chart = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
  var bar = chart.selectAll("g")
                  .data(data)
                  .enter()
                  .append("g")
                  .attr("transform", function(d, i) {
                    return "translate(" + 2*i + ", 0 )";
                  });
  bar.append("rect")
      .attr("width", 1)
      .attr("height", function(d){
        return(d["Num Transaction Count"] * transScaleFactor )
      })
      .attr("x", zeroXLevel )
      .attr("y", function(d){
//        return(height - zeroYLevel - d["Scaled Transaction Count"] - d["Scaled Price"])
        return(height - zeroYLevel - d["Num Transaction Count"] * transScaleFactor)
      })
      .attr("fill", "steelblue");
  bar.append("rect")
      .attr("width", 2)
      .attr("height", 2)
      .attr("x", zeroXLevel )
      .attr("y", function(d){
        return(height - zeroYLevel - d["Num Price"] * priceScaleFactor )
      })
      .attr("fill", "black");

      // var xScale = d3.scaleLinear()
      //     .domain([0, numDataPoints-1]) // input
      //     .range([0, width]); // output
      // chart.append("g")
      //     .attr("class", "x axis")
      //     .attr("transform", "translate(0," + height + ")")
      //     .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

      // Create the xAxis on the bottom of the chart
      var xScale = d3.scaleLinear()
        .domain([0,numDataPoints-1])  // Domain of possible values on the X Axis
        .range([0,width]);  // Range of possible values this domain will map to
      var xAxis = d3.axisBottom().scale(xScale);
      var axisGroup = chart.append("g")
        .attr("transform", "translate(" + zeroXLevel + "," + (height - zeroYLevel) + ")")
        .call(xAxis);

      // Create a yAxis on the left for the transaction data scale
      // 6. Y scale will use the randomly generate number
      var yScale = d3.scaleLinear()
          .domain([0, maxPrice]) // input
          .range([height-zeroXLevel, 10]); // output
      // 4. Call the y axis in a group tag
      chart.append("g")
          .attr("transform", "translate(50,0)")
          .attr("class", "y axis")
          .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

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
