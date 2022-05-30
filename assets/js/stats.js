fetch('/assets/data/stats.json')
    .then(res => res.json())
    .then((out) => {
        printRadar(out);
        printMixed(out);
        printBubble(out);
        printStackedBar(out);
        printDateStacked(out);
        //printPie(out);
        return out;
    })
    .catch(err => {
        document.getElementById('error-chart').append('⚠️ Charts could not be generated ' + err + ' ⚠️')
        document.getElementById('error-chart').style.display = "block";
    })
    .then(out => (document.getElementById('TotalPosts') ? fillInTable(out) : undefined));

/**
 * @param {{totalPosts: string, totalTags: string, totalWords: string, averageWordsPerPost: string }} data - the posts
 */
function fillInTable(data) {
    document.getElementById('TotalPosts').append(data.totalPosts)
    document.getElementById('TotalTags').append(data.totalTags)
    document.getElementById('TotalWords').append(data.totalWords)
    document.getElementById('AvgWords').append(data.averageWordsPerPost)
}

function printStackedBar(out) {
    const tagYear = years(out).map(i => i.year)
    const tagPosts = processTags(out, tagYear);
    const dataset = tagPosts.map(item => ({
        label: item.name,
        data: item.posts,
        backgroundColor: classic20[item.name] ?? classic20['grey'],
    }));

    new Chart(
        document.getElementById('stacked-bar-js').getContext('2d'),
        stackedBarConfig(tagYear, dataset, 'Tags stacked')
    );
}

function printDateStacked(out) {
    const yearMonths = years(out).map((item) => ({ year: item.year, months: groupByMonth(item.posts) }));
    const dataset = yearMonths.map(item => ({
        label: item.year,
        data: item.months.map(it => it.value),
        backgroundColor: Blues8[parseInt(item.year) % 8]
    }));

    new Chart(
        document.getElementById('stacked-bar-date-js').getContext('2d'),
        stackedBarConfig(MONTH_NUMBERS.map(it => monthToName(it)), dataset, 'Posts stacked')
    );
}

function stackedBarConfig(dates, dataset, title) {
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
                    text: title
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
    const dataset = years(out).map((item) => ({
        x: item.year,
        y: item.posts.length,
        r: item.posts.map(p => Math.floor(parseInt(p.words) / 500)).reduce((a, b) => a + b)
    }));

    new Chart(
        document.getElementById('bubble-js').getContext('2d'),
        bubbleConfig(bubbleData(dataset))
    );
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
    const yearPosts = years(out).map((item) => ({ date: item.year, posts: item.posts.length }));

    new Chart(
        document.getElementById('mixed-js').getContext('2d'),
        mixedConfig(mixedData(yearPosts))
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
            yAxisID: 'total',
            fill: false,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }, {
            type: 'bar',
            label: 'Articles per year',
            yAxisID: 'per-year',
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
                'total': {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true
                },
                'per-year': {
                    type: 'linear',
                    position: 'left',
                }
            }
        }
    };
}

function printRadar(out) {
    new Chart(
        document.getElementById('radar-js').getContext('2d'),
        radarConfig(radarData(postsPerTag(tags(out))))
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
                line: { borderWidth: 3 }
            }
        },
    }
}

function printPie(out) {
    new Chart(
        document.getElementById('pie-js').getContext('2d'),
        pieData(postsPerTag(tags(out)))
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

/**
 *
 * @param {{ posts: [{date: string, words: string, tags: string}] }} data - the posts
 * @param {[string]} tagYear - list of year
 * @return {[{ name: string, posts: Array }]} - tag and processed tagged posts per years
 */
const processTags = (data, tagYear) => tags(data).sort()
    .reduce((acc, current) => reducePostsPerTagPerYear(current, tagYear, acc), [])
    .sort((a, b) => (b.name === 'other') - (a.name === 'other'));

/**
 * @param {{tag: string, posts: Array}} current - current tag and posts
 * @param {[string]} tagYear - list of year
 * @param {[{ name: string, posts: Array }]} acc - tag and tagged posts per years
 * @return {*}
 */
function reducePostsPerTagPerYear(current, tagYear, acc) {
    const tagName = processTagName(current);
    const tagPosts = processTagPosts(current, tagYear);
    const existingTag = acc.find(i => i.name === tagName);

    if (existingTag) {
        existingTag.posts = existingTag.posts.map((val, index) => (val + tagPosts[index]));
    } else {
        acc.push({ name: tagName, posts: tagPosts })
    }
    return acc;
}

/**
 * @param {{tag: string, posts: Array}} current - current tag and posts
 * @return {string}
 */
const processTagName = (current) => {
    if (current.posts.length <= 3 || current.tag === 'misc') current.tag = 'other';
    return current.tag
}

/**
 * @param {{tag: string, posts: Array}} current - current tag and posts
 * @param {[string]} tagYear - list of year
 * @return {Array} - index (of year) -> amount of TagPosts
 */
const processTagPosts = (current, tagYear) => {
    current.posts = Object.entries(reduceDateToYear(current.posts))
        .map(post => ({ year: post[0], posts: post[1] }))
    return tagYear.map(date =>
        current.posts.reduce((sum, post) => sum + (post.year === date ? post.posts.length : 0), 0)
    )
}

/**
 * @param {[{ tag: string, posts: Array }]} tags
 * @return {{size: Array, labels: Array}}
 */
const postsPerTag = (tags) => {
    return {
        labels: tags.map(item => item.tag),
        size: tags.map(item => item.posts.length)
    }
}

/**
 * @param {{ posts: [{date: string, words: string, tags: string}] }} data - the posts
 * @return {[{ tag: string, posts: Array }]} - posts per tag
 */
const tags = (data) => Object.entries(data.posts.reduce((result, item) => ({
    ...result,
    [item.tags]: [...(result[item.tags] || []), item]
}), {})).map(tag => ({ tag: tag[0], posts: tag[1] }));

/**
 * @param {{ posts: [{date: string, words: string, tags: string}] }} data - the posts
 * @return {[{ year: string, posts: Array }]} - posts per year
 */
const years = (data) => Object.entries(reduceDateToYear(data.posts))
    .map(year => ({ year: year[0], posts: year[1] }));

/**
 * @param {[{date: string, words: string, tags: string}]} posts - the posts
 */
const reduceDateToYear = (posts) => posts.reduce((result, item) => ({
    ...result,
    [item.date.slice(0, -6)]: [...(result[item.date.slice(0, -6)] || []), item]
}), {});

/**
 * @param {[{date: string, words: string, tags: string}]} posts - the posts
 */
const groupByMonth = (posts ) => {
    let months = posts.map(post => post.date.slice(5, 7))
    return MONTH_NUMBERS.map(currentMonth => ({
        month: currentMonth,
        value: months.filter(month => month === currentMonth).length
    }));
}

const monthToName = (monthNumber) => new Date(2021, parseInt(monthNumber) - 1, 27)
    .toLocaleString('default', { month: 'short' })

const MONTH_NUMBERS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

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
    'database': '#aec7e8',
    'java': '#ff7f0e',
    'agile': '#ffbb78',
    'excel': '#2ca02c',
    'python': '#98df8a',
    'jekyll': '#d62728',
    'math': '#ff9896',
    'kotlin': '#9467bd',
    '---': '#c5b0d5',
    'linux': '#8c564b',
    'tips': '#c49c94',
    'graphql': '#e377c2',
    'git': '#f7b6d2',
    '-': '#7f7f7f',
    'grey': '#c7c7c7',  // css, ruby, open source, docker, misc
    'ctf': '#bcbd22',
    '--': '#dbdb8d',
    'kubernetes': '#17becf',
    'open source': '#9edae5'
};

const Blues8 = ['#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
