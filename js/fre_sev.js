d3.csv('data/fre_sev_MS.csv').then(fre_sev => {
    const width = 1300;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 80, left: 460 };

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

    const svg = d3.select('#vis')
        .append('svg')
        .attr('width', width + 200)  // 调整图像宽度以适应左侧图例
        .attr('height', height);

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

    const plot = svg.selectAll('circle')
        .data(fre_sev)
        .join('circle')
        .attr('class', 'Category')
        .attr('opacity', 0.75)
        .attr('fill', d => color(d.Category))
        .attr('cx', d => x(+d.Frequency))
        .attr('cy', d => y(+d.AvgCarsDerailed))
        .attr('r', 5);

    plot.append('title')
        .text(d => 
            `Category: ${d.Category}
Group Name: ${d.Group_Name}
Frequency: ${d.Frequency}
Average Cars Derailed: ${d.AvgCarsDerailed}
Track Class: ${d.Track}`
        );

    plot.on('mouseover', function () {
        d3.select(this).attr('stroke', '#333').attr('stroke-width', 20);
    }).on('mouseout', function () {
        d3.select(this).attr('stroke', null);
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
    const baselineOffset = 4; // text baseline offset, depends on radius and font size

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
        .on('click', (e, d) => selmodel.toggle(d.label))
        .on('dblclick', () => selmodel.clear());

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
        labels.attr('fill', d => selmodel.has(d.label) ? 'black' : '#bbb');
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
