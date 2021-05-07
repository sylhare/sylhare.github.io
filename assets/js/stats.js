fetch('/assets/data/stats.json')
    .then(res => res.json())
    .then((out) => {
        console.log('Checkout this JSON! ', out);
        printRadar(out['postsPerTag']);
    })
    .catch(err => {
        throw err
    });

function printRadar(postsPerTag) {
    new Chart(
        document.getElementById('radar').getContext('2d'),
        configRadar(radarData(
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

function configRadar(data) {
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

// var radar = new Chart(document.getElementById('radar').getContext('2d'), configRadar);
// var pie = new Chart(document.getElementById('radar').getContext('2d'), configRadar);
// var stackline = new Chart(document.getElementById('radar').getContext('2d'), configRadar);
// var bubble = new Chart(document.getElementById('radar').getContext('2d'), configRadar);
