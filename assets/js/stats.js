fetch('/assets/data/stats.json')
    .then(res => res.json())
    .then((out) => {
        //console.log('Checkout this JSON! ', out);
        fillInTable(out);
        printRadar(out['postsPerTag']);
        printStack(out);
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
        document.getElementById('bubble').getContext('2d'),
        bubbleConfig(bubbleData(out)));
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
                responsive: true,
                //maintainAspectRatio: false,
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                },
                x: {
                    ticks: {
                        stepSize: 1
                    }
                },

            },
        }
    };
}

function bubbleData(out) {
    let dataset = Object.entries(reduceDate(out['posts'], -6)).map((item) => {
        return {
            x: parseInt(item[0]),
            y: item[1].length,
            r: item[1].map(p => Math.floor(parseInt(p.words) / 500)).reduce((a, b) => a + b) }
    });

    console.log(dataset)

    return {
        datasets: [{
            label: 'Posts number / year / size',
            data: dataset,
            backgroundColor: 'rgb(255, 99, 132)'
        }]
    };
}

function printStack(out) {
    let posts_year = Object.entries(reduceDate(out['posts'], -6)).map((item) => {
        return { date: item[0], posts: item[1].length }
    })

    new Chart(
        document.getElementById('stack').getContext('2d'),
        stackConfig(stackData(posts_year)
        )
    );
}

function stackData(dataBar) {
    let sum;
    return {
        labels: dataBar.map(d => d.date),
        datasets: [{
            type: 'line',
            label: 'Total Articles',
            data: dataBar.map(d => d.posts).map(elem => sum = (sum || 0) + elem),
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

function stackConfig(data) {
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

function printRadar(postsPerTag) {
    new Chart(
        document.getElementById('radar').getContext('2d'),
        radarConfig(radarData(
            postsPerTag.map(o => o.name),
            postsPerTag.map(o => o.size)))
    );
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
        document.getElementById('pie').getContext('2d'),
        pieConfig(pieData(
            postsPerTag.map(o => o.name),
            postsPerTag.map(o => o.size)))
    );
}

function pieData(labels, data) {
    return {
        labels: labels,
        datasets: [{
            label: 'Articles per tag',
            data: data,
            backgroundColor: labels.map(o => colors[o] ?? getRandomColorHex()),
        }]
    };
}

function pieConfig(data) {
    return {
        type: 'doughnut',
        data: data,
    };
}

function reduceDate(data, amount) {
    return data.reduce((groups, item) => ({
        ...groups,
        [item.date.slice(0, amount)]: [...(groups[item.date.slice(0, amount)] || []), item]
    }), {});
}

function getRandomColorHex() {
    let hex = "0123456789ABCDEF",
        color = "#";
    for (let i = 1; i <= 6; i++) {
        color += hex[Math.floor(Math.random() * 16)];
    }
    return color;
}

const colors = {
    "agile": "rgb(107,91,149)",
    "linux": "rgb(255, 99, 132)",
    "excel": "rgb(0, 110, 81)",
    "java": "rgb(249, 103, 20)",
    "git": "rgb(216,174,71)",
    "jekyll": "rgb(187, 10, 30)",
    "math": "rgb(0,155,119)",
    "ruby": "rgb(157, 50, 50)",
    "python": "rgb(0, 83, 156)",
    "ctf": "rgb(42,41,62)",
    "database": "rgb(100, 100, 100)",
    "misc": "rgb(50,50,50)",
    "open source": "rgb(181,223,214)",
    "js": "rgb(239, 192, 80)",
    "docker": "rgb(63,105,170)",
    "kubernetes": "rgb(13,183,237)",
    "kotlin": "rgb(247, 120, 107)",
    "kafka": "rgb(147, 85, 41)",
    "css": "rgb(183, 107, 163)",
}
