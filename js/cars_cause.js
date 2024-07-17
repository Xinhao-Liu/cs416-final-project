d3.csv('data/cars_cause.csv').then(cars_cause => {
    const width = 1300;
    const height = 650;
    const margin = { top: 20, right: 20, bottom: 200, left: 460 };

    const x = d3.scaleBand()
        .domain(cars_cause.map(d => d.Group_Name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(cars_cause, d => +d.Total_Number_of_Cars)])
        .range([height - margin.bottom, margin.top])
        .nice();

    const color = d3.scaleOrdinal()
        .domain(cars_cause.map(d => d.Category))
        .range(["red", "orange", "blue", "magenta", "black"]);

    const svg = d3.select('#cars_cause_plot')
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
        .text('Total Number of Cars');

    // 设置x轴和y轴的tick text样式
    svg.selectAll('.x-axis .tick text')
        .attr('font-size', '12px')
        .attr('font-weight', 'normal');

    svg.selectAll('.y-axis .tick text')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold');


    // 添加工具提示div
    const mytooltip = d3.select('#cars_cause_plot')
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // 鼠标悬停、移动和离开事件的处理函数
    const mouseover = function(event, d) {
        mytooltip.style("opacity", 1);
        d3.select(this)
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
    };

    const mousemove = function(event, d) {
        mytooltip
            .html(`Category: ${d.Category}<br>Group Name: ${d.Group_Name}<br>Total Number of Cars Derailed: ${d.Total_Number_of_Cars}<br>Percentage of All: ${d.Percentage}`)
            .style("left", (event.pageX + 80) + "px")
            .style("top", (event.pageY - 230) + "px");
    };

    const mouseleave = function(event, d) {
        mytooltip
            .transition()
            .duration(10)
            .style("opacity", 0);
        d3.select(this)
            .attr('stroke', 'none')
            .attr('stroke-width', 0);
    };

    // 绘制柱状图
    const plot = svg.selectAll('rect')
        .data(cars_cause)
        .join('rect')
        .attr('class', 'Category')
        .attr('opacity', 0.75)
        .attr('fill', d => color(d.Category))
        .attr('x', d => x(d.Group_Name))
        .attr('y', d => y(+d.Total_Number_of_Cars))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(+d.Total_Number_of_Cars))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    const categories = [
        { label: 'Track' },
        { label: 'Signal' },
        { label: 'Human Factor' },
        { label: 'Equipment' },
        { label: 'Miscellaneous' }
    ];

    const selmodel = SelectionModel(); // <-- Instantiate a selection model

    const legend = svg.append('g')
        .attr('transform', `translate(${margin.left - 240}, ${margin.top + 50})`)
        .call(container => colorLegend(container, categories, color, selmodel));

    selmodel.on('change.chart', () => {
        plot.attr('fill', d => selmodel.has(d.Category) ? color(d.Category) : '#ccc');
    });
});

function colorLegend(container, categories, color, selmodel) {
    const titlePadding = 25;  // padding between title and entries
    const entrySpacing = 25;  // spacing between legend entries
    const entryRadius = 5;    // radius of legend entry marks
    const labelOffset = 10;    // additional horizontal offset of text labels
    const baselineOffset = 5; // text baseline offset, depends on radius and font size

    const title = container.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', 'black')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-weight', 'bold')
        .attr('font-size', '20px')
        .text('Cause Category');

    const entries = container.selectAll('g')
        .data(categories)
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${titlePadding + i * entrySpacing})`)
        .style('cursor', 'pointer')  // 鼠标悬停时变成手型
        .on('click', (e, d) => selmodel.toggle(d.label))
        .on('dblclick', () => selmodel.clear())
        .on('mouseover', function() {
            d3.select(this).select('text')
                .attr('font-weight', 'bold')
                .attr('fill', 'blue');
        })
        .on('mouseout', function() {
            d3.select(this).select('text')
                .attr('fill', d => selmodel.has(d.label) ? 'black' : 'gray')
                .attr('font-weight', d => selmodel.has(d.label) ? 'bold' : 'normal');
        });

    const symbols = entries.append('circle')
        .attr('cx', entryRadius) // <-- offset symbol x-position by radius
        .attr('r', entryRadius)
        .attr('fill', d => color(d.label));

    const labels = entries.append('text')
        .attr('x', 2 * entryRadius + labelOffset) // <-- place labels to the left of symbols
        .attr('y', baselineOffset) // <-- adjust label y-position for proper alignment
        .attr('fill', 'black')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .style('user-select', 'none') // <-- disallow selectable text
        .text(d => d.label);

    selmodel.on('change.legend', () => {
        symbols.attr('fill', d => selmodel.has(d.label) ? color(d.label) : '#ccc');
        labels
            .attr('fill', d => selmodel.has(d.label) ? 'black' : 'gray')
            .attr('font-weight', d => selmodel.has(d.label) ? 'bold' : 'normal');
    });
}

function SelectionModel() {
    const dispatch = d3.dispatch('change');
    const state = new Set();

    const api = {
        on: (type, fn) => (dispatch.on(type, fn), api),
        clear: () => (clear(), api),
        has: value => !state.size || state.has(value),
        set: value => (update(value, true), api),
        toggle: value => (update(value, !state.has(value)), api)
    };

    function clear() {
        if (state.size) {
            state.clear();
            dispatch.call('change', api, api);
        }
    }

    function update(value, add) {
        if (add && !state.has(value)) {
            state.add(value);
            dispatch.call('change', api, api);
        } else if (!add && state.has(value)) {
            state.delete(value);
            dispatch.call('change', api, api);
        }
    }

    return api;
}
