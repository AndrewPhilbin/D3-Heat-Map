let margin = { top: 50, right: 100, bottom: 100, left: 100 };

let height = 700 - margin.left - margin.right;
let width = 1400 - margin.top - margin.bottom;

let svg = d3
  .select('.container')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + 0 + ')');

d3.json(
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
).then((data) => {
  console.log(data);
  let refTemp = data.baseTemperature;

  let dataArray = data.monthlyVariance;
  let years = [];
  for (let i = 1754; i <= 2015; i++) {
    years.push(i);
  }

  var months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (mon) {
    return new Date(2000, mon).toLocaleString({}, { month: 'long' });
  });

  let temps = dataArray.map((item) => item.variance);

  console.log(temps);

  let x = d3
    .scaleLinear()
    .range([0, width])
    .domain([d3.min(years) - 2, d3.max(years) + 2]);

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .style('font-size', '14px')
    .call(d3.axisBottom(x).ticks(20).tickFormat(d3.format('d')));

  let y = d3
    .scaleBand()
    .range([height, 0])
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .padding(0.01);

  let yAxis = d3
    .axisLeft(y)

    .tickValues(y.domain())
    .tickFormat((d) => months[d]);

  svg.append('g').attr('id', 'y-axis').style('font-size', '14px').call(yAxis);
  console.log(d3.min(temps));

  // let colors = [
  //   '#0074ff',
  //   '#00c4ff',
  //   '#00ffd0',
  //   '#00ff10',
  //   '#8aff00',
  //   '#FFf000',
  //   '#FFbe00',
  //   '#FF8200',
  //   '#FF3c00',
  //   // '#FF0000',
  //   // '#FF0060',
  // ];

  // const colors = [
  //   '#5e519f',
  //   '#3788ba',
  //   '#6ac1a5',
  //   '#acdca6',
  //   '#e6f49d',
  //   '#fffec2',
  //   '#fddf90',
  //   '#f26d4a',
  //   '#d34052',
  //   '#9a0942',
  //   '#ff0000',
  // ];

  let myColor = d3
    .scaleSequential()
    .interpolator(d3.interpolateTurbo)
    .domain([d3.min(temps) + refTemp, d3.max(temps) + refTemp]);

  // let myColor = d3
  //   .scaleQuantile()
  //   .domain([d3.min(temps) + refTemp, d3.max(temps) + refTemp])
  //   .range(colors);
  let tooltip = d3
    .select('.container')
    .append('div')
    .attr('id', 'tooltip')

    .style('opacity', 0);

  let mouseover = function (d) {
    tooltip.style('opacity', 1);

    d3.select(this)
      .style('stroke', 'black')
      .style('opacity', 1)
      .attr('data-year', dataArray.year);
  };

  let mousemove = function (d, i) {
    tooltip
      .html(
        `${months[d.month - 1]}, ${d.year} <br>
      Temperature(C): ${d.variance + refTemp} <br>
      Departure from normal temperature(C): ${d.variance}`
      )
      .style('left', d3.mouse(this)[0] + 250 + 'px')
      .style('top', d3.mouse(this)[1] + 10 + 'px');
  };

  let mouseleave = function (d) {
    tooltip.style('opacity', 0);
    d3.select(this).style('opacity', 0.8).style('stroke', 'none');
  };

  svg
    .append('g')
    .selectAll('rect')
    .data(dataArray)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', (d, i) => x(d.year))
    .attr('y', (d, i) => y(d.month - 1))
    // .attr('ry', 5)
    .attr('width', width / years.length)
    .attr('height', y.bandwidth())
    .attr('fill', (d) => myColor(d.variance + refTemp))
    .attr('data-month', (d) => d.month - 1)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => d.variance + refTemp)
    .style('stroke-width', 1)
    .style('stroke', 'none')
    .style('opacity', 0.9)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave);

  let minTemp = d3.min(temps) + refTemp;
  let maxTemp = d3.max(temps) + refTemp;
  let resolution = Math.ceil(maxTemp / 1);
  let legendSwatch = [];
  for (let i = 0; i <= resolution; i++) {
    legendSwatch.push(i);
  }
  console.log(legendSwatch);
  let legendScale = d3.scaleLinear().domain([0, 15]).range([0, 400]);

  let legend = svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(' + width / 3 + ',' + (height + 80) + ')')

    .selectAll('rect')
    .data(legendSwatch)
    .enter()
    .append('rect')
    .attr('class', 'legendRect')
    .attr('x', (d) => legendScale(d) + 10)
    .attr('height', 40)
    .attr('width', 25)
    .attr('fill', (d) => myColor(d))
    .attr('stroke', 'black')
    .attr('stroke-width', 0.2)
    .style('opacity', 0.9);

  // legend
  //   .append('g')
  //   .append('text')
  //   .attr('x', 5)
  //   .attr('y', 5)
  //   .attr('class', 'legendText')
  //   .attr('text-anchor', 'middle')
  //   .style('fill', 'black')
  //   .style('font-size', '14px')
  //   .text('Temperature' + '(' + 'Celsius' + ')');

  legend
    .select('g')
    .data(legendSwatch)
    .enter()
    .append('text')
    .attr('class', 'legendText')
    .attr('x', (d) => legendScale(d) + 22)
    .attr('y', 60)
    .attr('text-anchor', 'middle')
    .style('fill', 'black')
    .style('font-size', '14px')
    .text((d) => d);
});
