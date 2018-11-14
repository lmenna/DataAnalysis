
function showBarChart(data, x, y, width, height) {

  data.splice(0, 500);
  var data = scaleData(data, "Transaction Count", 250);
  var data = scaleData(data, "Price", 250);
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
        return(d["Scaled Transaction Count"])
      })
      .attr("x", 10 )
      .attr("y", function(d){
        return(height - 200 - d["Scaled Transaction Count"] - d["Scaled Price"])
      })
      .attr("fill", "steelblue");
  bar.append("rect")
      .attr("width", 2)
      .attr("height", 2)
      .attr("x", 10 )
      .attr("y", function(d){
        return(height - 200 - d["Scaled Price"])
      })
      .attr("fill", "black");

      // var axisScale = d3.scaleLinear().domain([0,width]).range([0,height]);
      // var xAxis = d3.axisBottom().scale(axisScale);
      //var axisGroup = chart.append("g").call(xAxis);
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
