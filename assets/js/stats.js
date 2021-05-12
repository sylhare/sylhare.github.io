fetch('/assets/data/stats.json')
    .then(res => res.json())
    .then((out) => {
        //console.log('Checkout this JSON! ', out);
        fillInTable(out);
        printRadar(out['postsPerTag']);
        printMixed(out);
        printBubble(out);
        //printPie(out['postsPerTag']);
    })
    .catch(err => {
        throw err
    });

function fillInTable(data) {
    document.getElementById('TotalPosts').append(data['totalPosts'])
    document.getElementById('TotalTags').append(data['totalTags'])
    document.getElementById('TotalWords').append(data['totalWords'])
    document.getElementById('AvgWords').append(data['averageWordsPerPost'])
}

function printBubble(out) {
    new Chart(
        document.getElementById('bubble-js').getContext('2d'),
        bubbleConfig(bubbleData(out)));
}

function bubbleData(out) {
    let dataset = years(out).map((item) => {
        return {
            x: parseInt(item[0]),
            y: item[1].length,
            r: item[1].map(p => Math.floor(parseInt(p.words) / 500)).reduce((a, b) => a + b)
        }
    });

    return {
        datasets: [{
            label: 'Posts number / year / size',
            data: dataset,
            backgroundColor: 'rgb(255, 99, 132)'
        }]
    };
}

function bubbleConfig(data) {
    return {
        type: 'bubble',
        data: data,
        options: {
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
            scale: {
                y: {
                    beginAtZero: true,
                },
            },
        }
    };
}

function printMixed(out) {
    let posts_year = years(out).map((item) => {
        return { date: item[0], posts: item[1].length }
    })

    new Chart(
        document.getElementById('mixed-js').getContext('2d'),
        mixedConfig(mixedData(posts_year)
        )
    );
}

function mixedData(dataBar) {
    let sum;
    return {
        labels: dataBar.map(d => d.date),
        datasets: [{
            type: 'line',
            label: 'Total Articles',
            data: dataBar.map(elem => sum = (sum || 0) + elem.posts),
            fill: false,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }, {
            type: 'bar',
            label: 'Articles per year',
            data: dataBar.map(d => d.posts),
            borderColor: 'rgb(255, 205, 86)',
            backgroundColor: 'rgba(255, 205, 86, 0.5)'
        }]
    };
}

function mixedConfig(data) {
    return {
        type: 'scatter',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
}

function printRadar(postsPerTag) {
    new Chart(
        document.getElementById('radar-js').getContext('2d'),
        radarConfig(radarData(
            postsPerTag.map(o => o.name),
            postsPerTag.map(o => o.size)))
    );
}

function radarData(labels, data) {
    return {
        labels: labels,
        datasets: [{
            label: 'Articles per tag',
            data: data,
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
        }]
    }
}

function radarConfig(data) {
    return {
        type: 'radar',
        data: data,
        options: {
            scale: {
                min: 0
            },
            elements: {
                line: {
                    borderWidth: 3
                }
            }
        },
    }
}

function printPie(postsPerTag) {
    new Chart(
        document.getElementById('pie-js').getContext('2d'),
        pieData(
            postsPerTag.map(o => o.name),
            postsPerTag.map(o => o.size))
    );
}

function pieData(labels, data) {
    return {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Articles per tag',
                data: data,
                backgroundColor: labels.map(o => colors[o] ?? getRandomColorHex()),
            }]
        }
    };
}

const years = (out) => Object.entries(reduceDate(out['posts'], -6));

const reduceDate = (data, amount) => data.reduce((groups, item) => ({
    ...groups,
    [item.date.slice(0, amount)]: [...(groups[item.date.slice(0, amount)] || []), item]
}), {});

const getRandomColorHex = () => {
    let hex = '0123456789ABCDEF',
        color = '#';
    for (let i = 1; i <= 6; i++) {
        color += hex[Math.floor(Math.random() * 16)];
    }
    return color;
}

const colors = {
    'agile': 'rgba(107, 91, 149, 0.5)',
    'linux': 'rgba(255,  99,  132, 0.5)',
    'excel': 'rgba(0,  110,  81, 0.5)',
    'java': 'rgba(249,  103,  20, 0.5)',
    'git': 'rgba(216, 174, 71, 0.5)',
    'jekyll': 'rgba(187,  10,  30, 0.5)',
    'math': 'rgba(0, 155, 119, 0.5)',
    'ruby': 'rgba(157,  50,  50, 0.5)',
    'python': 'rgba(0,  83,  156, 0.5)',
    'ctf': 'rgba(42, 41, 62, 0.5)',
    'database': 'rgba(100,  100,  100, 0.5)',
    'misc': 'rgba(50, 50, 50, 0.5)',
    'open source': 'rgba(181, 223, 214, 0.5)',
    'js': 'rgba(239,  192,  80, 0.5)',
    'docker': 'rgba(63, 105, 170, 0.5)',
    'kubernetes': 'rgba(13, 183, 237, 0.5)',
    'kotlin': 'rgba(247,  120,  107, 0.5)',
    'kafka': 'rgba(147,  85,  41, 0.5)',
    'css': 'rgba(183,  107,  163, 0.5)',
}
