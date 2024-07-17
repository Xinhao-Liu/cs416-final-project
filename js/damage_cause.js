d3.csv('data/damage_cause.csv').then(damage_cause => {
    const width = 1300;
    const height = 650;
    const margin = { top: 20, right: 60, bottom: 200, left: 460 };

    const x = d3.scaleBand()
        .domain(damage_cause.map(d => d.Group_Name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(damage_cause, d => +d.Total_Damage_Cost)])
        .range([height - margin.bottom, margin.top])
        .nice();

    const y2 = d3.scaleLinear()
        .domain([0, 100]) // Assuming Cumulative_Percentage is in percentage (0-100)
        .range([height - margin.bottom, margin.top])
        .nice();

    const color = d3.scaleOrdinal()
        .domain(damage_cause.map(d => d.Category))
        .range(["red", "orange", "magenta", "blue", "black"]);

    const svg = d3.select('#damage_cause_plot')
        .append('svg')
        .attr('width', width + 200)  // 调整图像宽度以适应左侧图例
        .attr('height', height);

    // 绘制x轴
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(6).tickPadding(10))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -5)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

    // 绘制y轴
    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(10, "~s").tickSize(6).tickPadding(10))
        .selectAll("text")
        .attr("font-size", "20px")
        .attr("font-weight", "bold");

    // 添加y轴标签
    svg.append('text')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('x', -(height - margin.top - margin.bottom) / 2)
        .attr('y', margin.left / 2 + 175) // 根据需要调整标签位置
        .text('Total Damage Cost in Million $');

    // 绘制第二y轴
    svg.append('g')
        .attr('class', 'y-axis-2')
        .attr('transform', `translate(${width - margin.right}, 0)`)
        .call(d3.axisRight(y2).ticks(10).tickSize(6).tickPadding(10))
        .selectAll("text")
        .attr("font-size", "14px")
        .attr("font-weight", "bold");

    // 添加第二y轴标签
    svg.append('text')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('x', -(height - margin.top - margin.bottom) / 2)
        .attr('y', width - margin.right + 60) // 根据需要调整标签位置
        .text('Cumulative Percentage');

    // 设置x轴和y轴的tick text样式
    svg.selectAll('.x-axis .tick text')
        .attr('font-size', '12px')
        .attr('font-weight', 'normal');

    svg.selectAll('.y-axis .tick text')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold');

    svg.selectAll('.y-axis-2 .tick text')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold');

    // 添加工具提示div
    const mytooltip = d3.select('#damage_cause_plot')
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // 添加虚线
    const hoverLine = svg.append('line')
        .attr('stroke', 'gray')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0);

    let hideTimeout;

    // 鼠标悬停、移动和离开事件的处理函数（柱状图）
    const mouseoverBar = function(event, d) {
        clearTimeout(hideTimeout);
        mytooltip.style("opacity", 1);
        d3.select(this)
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
    };

    const mousemoveBar = function(event, d) {
        mytooltip
            .html(`Category: ${d.Category}<br>Group Name: ${d.Group_Name}<br>Total Damage Cost in Million $: ${d.Total_Damage_Cost}<br>Percentage of All: ${d.Percentage}`)
            .style("left", (event.pageX + 80) + "px")
            .style("top", (event.pageY - 230) + "px");
    };

    const mouseleaveBar = function(event, d) {
        hideTimeout = setTimeout(() => {
            mytooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
        }, 200);
        d3.select(this)
            .attr('stroke', 'none')
            .attr('stroke-width', 0);
    };

    // 鼠标悬停、移动和离开事件的处理函数（折线图）
    const mouseoverLine = function(event, d) {
        clearTimeout(hideTimeout);
        mytooltip.style("opacity", 1);
        hoverLine.style("opacity", 1);
        d3.select(this)
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
    };

    const mousemoveLine = function(event, d) {
        const [mouseX] = d3.pointer(event);
        const xValue = x(d.Group_Name) + x.bandwidth() / 2;
        mytooltip
            .html(`Group Name: ${d.Group_Name}<br>Cumulative Percentage: ${d.Cumulative_Percentage}%`)
            .style("left", (event.pageX + 80) + "px")
            .style("top", (event.pageY - 230) + "px");

        hoverLine
            .attr('x1', xValue)
            .attr('x2', xValue)
            .attr('y1', height - margin.bottom)
            .attr('y2', y2(d.Cumulative_Percentage));
    };

    const mouseleaveLine = function(event, d) {
        hideTimeout = setTimeout(() => {
            mytooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
            hoverLine
                .transition()
                .duration(200)
                .style("opacity", 0);
        }, 200);
        d3.select(this)
            .attr('stroke', 'none')
            .attr('stroke-width', 0);
    };

    // 绘制柱状图
    const plot = svg.selectAll('rect')
        .data(damage_cause)
        .join('rect')
        .attr('class', 'Category')
        .attr('opacity', 0.75)
        .attr('fill', d => color(d.Category))
        .attr('x', d => x(d.Group_Name))
        .attr('y', d => y(+d.Total_Damage_Cost))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(+d.Total_Damage_Cost))
        .on("mouseover", mouseoverBar)
        .on("mousemove", mousemoveBar)
        .on("mouseleave", mouseleaveBar);

    // 绘制折线图
    const line = d3.line()
        .x(d => x(d.Group_Name) + x.bandwidth() / 2)
        .y(d => y2(+d.Cumulative_Percentage));

    svg.append("path")
        .datum(damage_cause)
        .attr("fill", "none")
        .attr("stroke", "purple")
        .attr("stroke-width", 5)
        .attr("d", line);

    // 添加折线图上的数据点
    svg.selectAll('circle.line-point')
        .data(damage_cause)
        .enter()
        .append('circle')
        .attr('class', 'line-point')
        .attr('cx', d => x(d.Group_Name) + x.bandwidth() / 2)
        .attr('cy', d => y2(d.Cumulative_Percentage))
        .attr('r', 5)
        .attr('fill', 'purple')
        .on("mouseover", mouseoverLine)
        .on("mousemove", mousemoveLine)
        .on("mouseleave", mouseleaveLine);

            // 添加可拖动的callout注释
    const calloutLine = svg.append("line")
    .attr("class", "callout-line")
    .attr("x1", x(damage_cause[0].Group_Name) + x.bandwidth() / 2)
    .attr("y1", y(damage_cause[0].Total_Damage_Cost))
    .attr("x2", x(damage_cause[0].Group_Name) + x.bandwidth() / 2 + 30)
    .attr("y2", y(damage_cause[0].Total_Damage_Cost) - 20)
    .attr("stroke", "gray")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4,4");

    const callout = svg.append("g")
        .attr("class", "callout")
        .attr("transform", `translate(${x(damage_cause[0].Group_Name) + 30}, ${y(damage_cause[0].Total_Damage_Cost) - 20})`)
        .call(d3.drag().on("drag", function(event) {
            d3.select(this).attr("transform", `translate(${event.x}, ${event.y})`);
            calloutLine.attr("x2", event.x).attr("y2", event.y);
        }));

    callout.append("rect")
        .attr("width", 230)
        .attr("height", 100)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 10)  // 设置圆角半径
        .attr("ry", 10);

    callout.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(`Category: ${damage_cause[0].Category}`);

    callout.append("text")
        .attr("x", 10)
        .attr("y", 40)
        .attr("font-size", "14px")
        .text(`Group Name: ${damage_cause[0].Group_Name}`);

    callout.append("text")
        .attr("x", 10)
        .attr("y", 60)
        .attr("font-size", "14px")
        .text(`Total Damage Cost in Million $: ${damage_cause[0].Total_Damage_Cost}`);

    callout.append("text")
        .attr("x", 10)
        .attr("y", 80)
        .attr("font-size", "14px")
        .text(`Percentage of All: ${damage_cause[0].Percentage}`);

    const categories = [
        { label: 'Track' },
        { label: 'Signal' },
        { label: 'Human Factor' },
        { label: 'Equipment' },
        { label: 'Miscellaneous' }
    ];

    const selmodel = SelectionModel(); // <-- Instantiate a selection model

    const legend = svg.append('g')
        .attr('transform', `translate(${margin.left - 260}, ${margin.top + 50})`)
        .call(container => colorLegend(container, categories, color, selmodel));

    selmodel.on('change.chart', () => {
        plot.attr('fill', d => selmodel.has(d.Category) ? color(d.Category) : '#ccc');
    });
});
