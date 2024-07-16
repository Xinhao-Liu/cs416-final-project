new fullpage('#fullpage', {
    //options here
    autoScrolling:true,
    scrollHorizontally: true,
    navigation: true,
    anchors: ['intro', 'datavis', 'causecategories', 'freq.&sev.', 'totalcars', 'totaldamage', 'findings', 'ref'],
	navigationPosition: 'right',
	navigationTooltips: ['Introduction', 
						'Dataset and Visualization', 
						'Accident Cause Categories', 
						'Frequency vs. Severity', 
						'Total Cars Derailed vs. Cause', 
						'Total Damage vs. Cause', 
						'Findings', 
						'References'],
    scrollOverflow: false,
    scrollOverflowMacStyle: false,
    scrollOverflowReset: false,
});

