fetch('/assets/data/stats.json')
    .then(res => res.json())
    .then((out) => {
        fillInTable(out);
        printRadar(out);
        printMixed(out);
        printBubble(out);
        printStackedBar(out);
        //printPie(out);
    })
    .then()
    .catch(err => {
        throw err
    });

function fillInTable(data) {
    document.getElementById('TotalPosts').append(data['totalPosts'])
    document.getElementById('TotalTags').append(data['totalTags'])
    document.getElementById('TotalWords').append(data['totalWords'])
    document.getElementById('AvgWords').append(data['averageWordsPerPost'])
}

function printStackedBar(out) {
    const tagYear = years(out).map(i => i[0])
    const tagPosts = processTags(out, tagYear);

    let dataset = tagPosts
        .map(item => {
            return {
                label: item[0],
                data: item[1],
                backgroundColor: classic20[item[0]] ?? classic20['grey'],
            }
        });

    new Chart(
        document.getElementById('stacked-bar-js').getContext('2d'),
        stackedBarConfig(tagYear, dataset));
}


function stackedBarConfig(dates, dataset) {
    return {
        type: 'bar',
        data: {
            labels: dates,
            datasets: dataset
        },
        options: {
            aspectRatio: 1,
            plugins: {
                title: {
                    display: true,
                    text: 'Tags stacked'
                },
                legend: {
                    display: true,
                    position: 'right',
                },
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    ticks: { beginAtZero: true },
                    stacked: true
                }
            }
        }
    };
}

function printBubble(out) {
    let dataset = years(out).map((item) => {
        return {
            x: item[0],
            y: item[1].length,
            r: item[1].map(p => Math.floor(parseInt(p.words) / 500)).reduce((a, b) => a + b)
        }
    });

    new Chart(
        document.getElementById('bubble-js').getContext('2d'),
        bubbleConfig(bubbleData(dataset)));
}

function bubbleData(dataset) {
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
            aspectRatio: 1.30,
            plugins: {
                legend: { position: 'bottom', },
            },
            scale: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 }
                },
            },
        }
    };
}

function printMixed(out) {
    let yearPosts = years(out).map((item) => {
        return { date: item[0], posts: item[1].length }
    })
    new Chart(
        document.getElementById('mixed-js').getContext('2d'),
        mixedConfig(mixedData(yearPosts)
        )
    );
}

function mixedData(yearPosts) {
    let sum;
    return {
        labels: yearPosts.map(d => d.date),
        datasets: [{
            type: 'line',
            label: 'Total Articles',
            data: yearPosts.map(elem => sum = (sum || 0) + elem.posts), // cumulative sum of posts
            fill: false,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }, {
            type: 'bar',
            label: 'Articles per year',
            data: yearPosts.map(d => d.posts),
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
            aspectRatio: 1.30,
            scales: {
                y: { beginAtZero: true }
            }
        }
    };
}

function printRadar(out) {
    let postsPerTag = tagsPosts(out)
    new Chart(
        document.getElementById('radar-js').getContext('2d'),
        radarConfig(radarData(postsPerTag))
    );
}

function radarData(postsPerTag) {
    return {
        labels: postsPerTag.labels,
        datasets: [{
            label: 'Articles per tag',
            data: postsPerTag.size,
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
            scale: { min: 0 },
            elements: {
                line: {
                    borderWidth: 3
                }
            }
        },
    }
}

function printPie(out) {
    new Chart(
        document.getElementById('pie-js').getContext('2d'),
        pieData(tagsPosts(out))
    );
}

function pieData(postsPerTag) {
    return {
        type: 'doughnut',
        data: {
            labels: postsPerTag.labels,
            datasets: [{
                label: 'Articles per tag',
                data: postsPerTag.size,
                backgroundColor: postsPerTag.labels.map(o => colors[o] ?? getRandomColorHex()),
            }]
        }
    };
}

const processTags = (out, tagYear) => tags(out['posts']).sort().reduce((acc, current) => {
    const tagName = processTagName(current)
    const tagPosts = processTagPosts(current, tagYear);
    const existingTag = acc.find(i => i[0] === tagName)

    if (existingTag) {
        existingTag[1] = existingTag[1].map((val, i) => val + tagPosts[i]);
    } else {
        acc.push([tagName, tagPosts])
    }
    return acc;
}, []).sort((a, b) => (b[0] === 'other') - (a[0] === 'other'));

const processTagName = (current) => {
    if (current[1].length <= 2 || current[0] === "misc") current[0] = "other"
    return current[0]
}

const processTagPosts = (current, tagYear) => {
    current[1] = Object.entries(reduceDate(current[1], -6))
    return tagYear.map(date =>
        current[1].reduce((sum, post) => sum + (post[0] === date ? post[1].length : 0), 0)
    )
}

const tagsPosts = (out) => {
    return {
        labels: out['postsPerTag'].map(o => o.name),
        size: out['postsPerTag'].map(o => o.size)
    }
}

const tags = (data) => Object.entries(data.reduce((groups, item) => ({
    ...groups,
    [item.tags]: [...(groups[item.tags] || []), item]
}), {}));

const years = (out) => Object.entries(reduceDate(out['posts'], -6));

const reduceDate = (data, amount) => data.reduce((groups, item) => ({
    ...groups,
    [item.date.slice(0, amount)]: [...(groups[item.date.slice(0, amount)] || []), item]
}), {});

const getRandomColorHex = () => {
    let hex = '0123456789ABCDEF', color = '#';
    for (let i = 1; i <= 6; i++) {
        color += hex[Math.floor(Math.random() * 16)];
    }
    return color;
}

const colors = {
    'agile': 'rgba(107, 91, 149, 0.85)',
    'linux': 'rgba(255,  99,  132, 0.85)',
    'excel': 'rgba(0,  110,  81, 0.85)',
    'java': 'rgba(249,  103,  20, 0.85)',
    'git': 'rgba(216, 174, 71, 0.85)',
    'jekyll': 'rgba(187,  10,  30, 0.85)',
    'math': 'rgba(0, 155, 119, 0.85)',
    'ruby': 'rgba(157,  50,  50, 0.85)',
    'python': 'rgba(0,  83,  156, 0.85)',
    'ctf': 'rgba(42, 41, 62, 0.85)',
    'database': 'rgba(100,  100,  100, 0.85)',
    'misc': 'rgba(50, 50, 50, 0.85)',
    'open source': 'rgba(181, 223, 214, 0.85)',
    'js': 'rgba(239,  192,  80, 0.85)',
    'docker': 'rgba(63, 105, 170, 0.85)',
    'kubernetes': 'rgba(13, 183, 237, 0.85)',
    'kotlin': 'rgba(247,  120,  107, 0.85)',
    'kafka': 'rgba(147,  85,  41, 0.85)',
    'css': 'rgba(183,  107,  163, 0.85)',
}

const classic20 = {
    'js': '#1f77b4',
    'python': '#aec7e8',
    'java': '#ff7f0e',
    'agile': '#ffbb78',
    'excel': '#2ca02c',
    'database': '#98df8a',
    'jekyll': '#d62728',
    'math': '#ff9896',
    'linux': '#9467bd',
    '-------': '#c5b0d5',
    '-----': '#8c564b',
    '---': '#c49c94',
    'kotlin': '#e377c2',
    'git': '#f7b6d2',
    '-': '#7f7f7f',
    'grey': '#c7c7c7',  // css, ruby, open source, docker, misc
    'ctf': '#bcbd22',
    '----': '#dbdb8d',
    'kubernetes': '#17becf',
    '------': '#9edae5'
};
