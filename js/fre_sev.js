d3.csv('data/fre_sev_MS.csv').then(fre_sev => {
    const width = 1300;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 80, left: 460 };
    const avgFrequency = 189.14;
    const avgSeverity = 8.128;

    const x = d3.scaleLinear()
        .domain([0, d3.max(fre_sev, d => +d.Frequency)])
        .range([margin.left, width - margin.right])
        .nice();

    const y = d3.scaleLinear()
        .domain([0, d3.max(fre_sev, d => +d.AvgCarsDerailed)])
        .range([height - margin.bottom, margin.top])
        .nice();

    const color = d3.scaleOrdinal()
        .domain(fre_sev.map(d => d.Category))
        .range(["red", "orange", "blue", "magenta", "black"]);

    const svg = d3.select('#fre_sev_plot')
        .append('svg')
        .attr('width', width + 200)  // 调整图像宽度以适应左侧图例
        .attr('height', height);

    // 绘制x轴和y轴
    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(6).tickPadding(10))
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('x', (width + margin.left - margin.right) / 2)
        .attr('y', 60)
        .text('Number of Accidents (Frequency)');

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).tickSize(6).tickPadding(10))
        .append('text')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('x', -(height - margin.top - margin.bottom) / 2)
        .attr('y', -50)
        .text('Average of Cars Derailed (Severity)');

    svg.selectAll('.tick text')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold');

    // 添加工具提示div
    const mytooltip = d3.select('#fre_sev_plot')
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
        .attr('stroke-width', 7);
    };

    const mousemove = function(event, d) {
        mytooltip
            .html(`Category: ${d.Category}<br>Group Name: ${d.Group_Name}<br>Frequency: ${d.Frequency}<br>Average Cars Derailed: ${d.AvgCarsDerailed}<br>Track Class: ${d.Track}`)
            .style("left", (event.pageX + 80) + "px")
            .style("top", (event.pageY - 230) + "px");
    };

    const mouseleave = function(event, d) {
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

    // 绘制散点图
    const plot = svg.selectAll('circle')
        .data(fre_sev)
        .join('circle')
        .attr('class', 'Category')
        .attr('opacity', 0.75)
        .attr('fill', d => color(d.Category))
        .attr('cx', d => x(+d.Frequency))
        .attr('cy', d => y(+d.AvgCarsDerailed))
        .attr('r', 5)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // 绘制虚线
    svg.append('line')
        .attr('x1', x(avgFrequency))
        .attr('x2', x(avgFrequency))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'gray')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.8);

    svg.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(avgSeverity))
        .attr('y2', y(avgSeverity))
        .attr('stroke', 'gray')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.8);

    // 添加注释
    svg.append('text')
        .attr('x', x(avgFrequency) + 80)
        .attr('y', margin.top + 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('fill', 'black')
        .text('Average Frequency');

    svg.append('text')
        .attr('x', 1300)
        .attr('y', y(avgSeverity) - 10)
        .attr('text-anchor', 'end')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('fill', 'black')
        .text('Average Severity');

    // 添加象限注释
    const quadrantText = [
        { text: 'Less Frequent', x: margin.left + 9, y: margin.top + 110 },
        { text: 'More Severe', x: margin.left + 8, y: margin.top + 130 },
        { text: 'Less Frequent', x: margin.left + 9, y: margin.top + 420 },
        { text: 'Less Severe', x: margin.left + 8, y: margin.top + 440 },
        { text: 'More Frequent', x: margin.left + 400, y: margin.top + 110},
        { text: 'More Severe', x: margin.left + 400, y: margin.top + 130 },
        { text: 'More Frequent', x: margin.left + 400, y: margin.top + 420 },
        { text: 'Less Severe', x: margin.left + 400, y: margin.top + 440 }
    ];

    quadrantText.forEach(q => {
        svg.append('text')
            .attr('x', q.x)
            .attr('y', q.y)
            .attr('text-anchor', q.anchor || 'start')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'Helvetica Neue, Arial')
            .attr('fill', 'gray')
            .text(q.text);
    });

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
    
    legend.append('rect')
        .attr('x', -60)
        .attr('y', -30)
        .attr('width', 245)
        .attr('height', categories.length * 25 + 55)  // Adjust the height based on the number of categories
        .attr('fill', 'rgba(255, 255, 255, 0.7)')  // 半透明背景框
        .attr('stroke', 'black')
        .attr('rx', 10)  // 圆角矩形
        .attr('ry', 10);

    legend.call(container => colorLegend(container, categories, color, selmodel));

    selmodel.on('change.chart', () => {
        plot.attr('fill', d => selmodel.has(d.Category) ? color(d.Category) : '#ccc');
    });
});

function colorLegend(container, categories, color, selmodel) {
    const titlePadding = 25;  // padding between title and entries
    const entrySpacing = 25;  // spacing between legend entries
    const entryRadius = 5;    // radius of legend entry marks
    const labelOffset = 10;    // additional horizontal offset of text labels
    const baselineOffset = 6; // text baseline offset, depends on radius and font size

    const title = container.append('text')
        .attr('x', -45)
        .attr('y', 0)
        .attr('fill', 'black')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-weight', 'bold')
        .attr('font-size', '20px')
        .text('Select Cause Category');

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
                .attr('fill', 'purple');
        })
        .on('mouseout', function() {
            d3.select(this).select('text')
                .attr('fill', d => selmodel.has(d.label) ? color(d.label) : 'gray')
                .attr('font-weight', d => selmodel.has(d.label) ? 'bold' : 'normal');
        });

    entries.append('rect')
        .attr('x', -10)
        .attr('y', -10)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', 'none')
        .attr('stroke', 'black');

    const checkmarks = entries.append('path')
        .attr('d', 'M-7,-2 L-3,3 L3,-7')
        .attr('stroke-width', 4)
        .attr('fill', 'none')
        .attr('stroke', d => color(d.label))
        .attr('opacity', d => selmodel.has(d.label) ? 1 : 0);

    const symbols = entries.append('circle')
        .attr('cx', entryRadius + 18) // <-- offset symbol x-position by radius
        .attr('r', entryRadius)
        .attr('fill', d => color(d.label));

    const labels = entries.append('text')
        .attr('x', 2 * entryRadius + 15 + labelOffset) // <-- place labels to the left of symbols
        .attr('y', baselineOffset) // <-- adjust label y-position for proper alignment
        .attr('fill', d => color(d.label))
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .style('user-select', 'none') // <-- disallow selectable text
        .text(d => d.label);

    selmodel.on('change.legend', () => {
        checkmarks.attr('opacity', d => selmodel.has(d.label) ? 1 : 0);
        symbols.attr('fill', d => selmodel.has(d.label) ? color(d.label) : '#ccc');
        labels
            .attr('fill', d => selmodel.has(d.label) ? color(d.label) : 'gray')
            .attr('font-weight', d => selmodel.has(d.label) ? 'bold' : 'normal');
    });
}

function SelectionModel(defaultState = []) {
    const dispatch = d3.dispatch('change');
    const state = new Set(defaultState);

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
