---
layout: post
title: load test with k6
color: rgb(125, 100, 255)
tags: [open-source]
---

[K6][1] made by [Grafana][2] is an open-source load testing tool which offers the ability to write scenarios to simulate
traffic on your system.
The test scenarios can be written in Typescript (when transpiled into javascript) and offer a wide range of features 
([spike][3], [smoke][3], [stress][3], [soak tests][3]) to analyse the system under load.

## ⚙️ Installation

### Initialize project

You can use the template provided by grafana to set up your k6 typescript project:

- [k6-template-typescript][4]

Unfortunately, k6 doesn't run the typescript files directly, so you will need to transpile the typescript files 
into javascript. 
The template uses [Babel][5] and [Webpack][6] to bundle the different files into ES modules (ESM) that the k6 will be able to run.
That's why you will need to install and bundle the file before being able to run the tests:

```shell
npm install
npm run bundle
```

The typescript files in the `src` folder should be now available as k6 compatible javascript files in the `dist` folder.

### K6 CLI

The [K6 CLI][7] can be used to create k6 js scripts, but also to run them.
Install the k6 CLI on macOS using:

```shell
brew install k6
```

This should install the k6 CLI on your system, you can probe it by running `k6 --version`. 
If you have a k6 cloud account, you can log in via the CLI and follow the [cloud documentation][10].
In this article, we will focus on running the tests locally, but the core concepts apply to the cloud as well.

You can try to run a test from the template using:

```shell
k6 run ./dist/get-200-status-test.js
```

And the test should run smoothly, outputting the results in the console.
Now let's write our own test!

## 📝  K6 Test script

In k6, we speak of [VU][7] (Virtual User), which are the simulated users that will perform the actions described within
the test script.

### Test structure

The k6 test is usually [formatted][8] as such:

```ts
// 1. init code

export function setup(): any {
  // 2. setup code
  return data;
}

export default function (data: any) {
  // 3. scenario code
}

export function teardown(data: any) {
  // 4. teardown code
}
```

- Init code:
  - Usually run once per Virtual User (VU).
  - Used for imports, options, and defining functions for the test.
- Setup code:
  - Run only once at the beginning.
  - Used to set up the data for each VU.
- Test code:
  - Run for each VU.
  - For the actual test, the code that will be executed to simulate traffic.
  - The `data` parameter is being populated by the return of the `setup` function.
- Teardown code:
  - Run only once at the end if the test was executed successfully.
  - Used to clean up the data for each VU.
  - The `data` parameter is being populated by the return of the `setup` function.

### Test Scenario

The scenario within the _VU code_ part or the `default` function is where the actual test is being performed.
You can use the `http` module to make requests to the server, and the `check` module to validate the responses.

```ts
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const result = http.get('http://test.k6.io');
  check(result, {
    'status is 200': () => result.status === 200,
  });
}
```

This is a fairly simple scenario; in a concrete example, you may have to add more calls to it. 
This can quickly get messy, that's why `k6` provides a way to structure the scenario with the `group` function.

```ts
import { group } from 'k6';

export default function () {
  group('Access home and login', function () {
    // ...
  });
  group('browse product and click to buy', function () {
    // ...
  });
  group('checkout process', function () {
    // ...
  });
}
```

As you can see, the groups are used to "group" different stages of the scenario, they should contain more than one call
to the server (and can be nested). They are called sequentially and will be displayed in the test results.

## 🧑‍💻 K6 Testing

### Run the test

Use `k6 run <script>` to run your test.
If you need or want more details, you can see the k6 debug log with the `--verbose` option.
For the full http context, use `--http-debug="full"` option, to print the full HTTP request and response.

```shell
k6 run --verbose --http-debug="full" ./dist/script.js
```

As a reminder, since it's a typescript project, the test files are compiled and available in the `dist` folder.

If you need to log extra information for debugging **locally**,
you can leverage `console.log` in an init function of your test script:

```ts
function logResponse(response: { body: any }) {
  console.log(response.body);
}
```

Because, using `console.log` directly in the test script won't work.
Once the test has run, the result will be printed in the terminal.   

### Run options

By default, we have one scenario per k6 test file; it corresponds to the code executed in the `default` function.
But you can have more than one scenario by having multiple named functions exported in the test file.

#### Basics options

In our case, the k6 options I am interested in are the one that defines the behaviour of our virtual users.
They can be passed as command line arguments (as `--vu 10 -d 1s` for 10 users for 1 second), but you can also define
them in the init part of the test:

```ts
import { Options } from 'k6/options';

export const options: Options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '1m', target: 0 },
  ],
};
```

This plain option defines how the number of VUs will evolve during the test:
1. The number of VU will ramp up to 10 VUs in 1 minute
2. The VUs will go from 10 to 20 VUs for 1 minute
3. The number of VUs will slowly go back to 0 VUs for the last minute

This is for a smoother approach for load testing, where the load is being built up gradually and then decreased.

#### More with executors

In the case where you don't want to manually set up the stage of your load test, you can use the [executors][9] option.
Those are predefined behaviours to manage VUs and iterations during the scenario.
Here is a none-exhaustive list of executors:

- Shared iterations: As `shared-iterations`	which defines a fixed number of iterations is shared between a number of VUs.
- Per VU iterations: As `per-vu-iterations`	where each VU executes an exact number of iterations.
- Constant VUs:	As `constant-vus` where a fixed number of VUs execute as many iterations as possible for a specified amount of time.
- Ramping VUs: As `ramping-vus` where the number of VUs slowly grows to execute as many iterations as possible for a specified amount of time.
- Constant Arrival Rate: As `constant-arrival-rate` where a fixed number of iterations are executed in a specified period of time.
- Ramping Arrival Rate:	As `ramping-arrival-rate` where a variable number of iterations are executed in a specified period of time.

Here is what it would look like in the test:

```ts
export let options = {
  scenarios: {
    myScenario: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
    },
  },
};
```

In this example we have renamed the _scenario_ from `default` to `myScenario`, and without naming the `export default`
function, since we have only one scenario.
Then we are using the constant VUs executor to have 10 VUs for 1 minute.

Now we should have enough to run the k6 load test to our liking! 🧑‍🔧

### Result snapshot

Let's describe the output that you get when you run a script locally, I'll use on the template one.
You can't forget the tool's name when it's printed at the end of each run:

```shell

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

     execution: local
        script: ./dist/get-200-status-test.js
        output: -

     scenarios: (100.00%) 1 scenario, 50 max VUs, 40s max duration (incl. graceful stop):
              * default: 50 looping VUs for 10s (gracefulStop: 30s)


     ✓ status is 200

     checks.........................: 100.00% ✓ 474       ✗ 0   
     data_received..................: 5.9 MB  532 kB/s
     data_sent......................: 113 kB  10 kB/s
     http_req_blocked...............: avg=10.84ms min=0s      med=4µs     max=151.11ms p(90)=75.99ms p(95)=90.19ms
     http_req_connecting............: avg=5.04ms  min=0s      med=0s      max=54.92ms  p(90)=39.91ms p(95)=47.99ms
     http_req_duration..............: avg=51.03ms min=20.89ms med=37.49ms max=626.14ms p(90)=62.52ms p(95)=78.8ms 
       { expected_response:true }...: avg=51.03ms min=20.89ms med=37.49ms max=626.14ms p(90)=62.52ms p(95)=78.8ms 
     http_req_failed................: 0.00%   ✓ 0         ✗ 948 
     http_req_receiving.............: avg=2.39ms  min=10µs    med=60µs    max=505.64ms p(90)=140µs   p(95)=1.66ms 
     http_req_sending...............: avg=18.46µs min=3µs     med=16µs    max=295µs    p(90)=27µs    p(95)=32.64µs
     http_req_tls_handshaking.......: avg=3.94ms  min=0s      med=0s      max=104.81ms p(90)=0s      p(95)=45.24ms
     http_req_waiting...............: avg=48.62ms min=20.84ms med=37.08ms max=626.05ms p(90)=49.35ms p(95)=74.25ms
     http_reqs......................: 948     85.659676/s
     iteration_duration.............: avg=1.12s   min=1.05s   med=1.07s   max=1.89s    p(90)=1.28s   p(95)=1.37s  
     iterations.....................: 474     42.829838/s
     vus............................: 16      min=16      max=50
     vus_max........................: 50      min=50      max=50


running (11.1s), 00/50 VUs, 474 complete and 0 interrupted iterations
default ✓ [======================================] 50 VUs  10s
```

That's a lot of information! 🤯 
At the end, we have the summary of the test that gets updated in real time, with the duration
of the test, the active users, the completed iterations, and the interrupted ones.

Now if we look at the main part of the output we see a bunch of metrics that are collected, let's try to decipher what
they mean:
  
- `data_received` and `data_sent` indicate the amount of data the VUs received and sent respectively during the test. 
- `http_req_duration` is the total time for the request, it is the sum of `http_req_sending`, `http_req_waiting`, and `http_req_receiving`.
- `http_req_failed` shows that none (0.00%) of the total HTTP requests failed.
- `http_reqs` indicates the total number of HTTP requests made, with the rate of requests shown as per second.
- `iteration_duration` indicates how long each iteration (a single user journey from start to finish) is taking.
- `iterations` indicates the number of iterations completed during the test. One iteration usually corresponds to one virtual user visiting your website.
  - It should be correlated with the `http_reqs` variable.
- `vus` shows the number of active Virtual Users at the current stage of the test. 
- `vus_max` shows the maximum number of virtual users used in the test.

At some point, increasing the VUs won't increase the number of iterations, because the server can't handle more requests.
In those times, you may need to improve the backend side of your application. (Code-wise, hardware-wise, or both).

## 📉 K6 Metrics and Output

### Advanced stats

You can save the json output of the k6 run using:

```shell
k6 run script.js --out json=results.jsonl
```

This will save all the k6 metrics that you see in the console in a JSON Line file (one row is one json object) for the
duration of the test.
This can be used to further analyze the results.

Here is an example of what it would look like with the base metric `http_reqs` that we've seen the aggregated result 
in the console output and its base tags:

```json
{"type":"Metric","data":{"name":"http_reqs","type":"counter","contains":"default","thresholds":[],"submetrics":null},"metric":"http_reqs"}
{"metric":"http_reqs","type":"Point","data":{"time":"2024-03-19T14:59:30.714081-04:00","value":1,"tags":{"expected_response":"true","group":"::Browse test.k6.io","method":"GET","name":"http://test.k6.io","proto":"HTTP/1.1","scenario":"default","status":"308","url":"http://test.k6.io"}}}
```

Not very readable, but hang on, we'll get to that! 🧐

Now you can "enhance" those results with `Trend` and `tags`:
- A _Trend_ is a custom metric defined in the test
- A _tag_ is a custom metadata added to a metric (custom or not)

### Adding trend and tags

The trend gets defined in the init part of the test, then it's used via the `add` method to add values to that metrics at
each iteration.

The tag is only used within the test code to _tag_ the metrics it is associated with. 
It is only relevant when analysing the outputted metrics in JSON. 
([Grafana][2] is _obviously_ a tool of choice to display the metrics) This is how the code would look like: 

```ts
import { Trend } from 'k6/metrics';

const taggedTrend = new Trend('trend_tagged');

export default function () {
  const result = http.get('http://test.k6.io', {
    tags: { tag_key: 'tag_value' },
  });
  taggedTrend.add(result.timings.duration, { tag_connection_time: 'k6_website' });
  
  check(result, { 'status is 200': () => result.status === 200, });
}
```

We have tagged two things:
- The request with the tag `tag_key: 'tag_value'`, so the default k6 _http_ metrics will have this tag.
- The trend that stores the duration of the call as value with the tag `tag_connection_time: 'k6_website'`, so the custom _tagged_trend_ metric will have this tag.

### Custom tag and trends output

Now that we have added the tags and run the test, we'll have a bunch of JSON lines with the metrics
(as one line per metrics definition as `Metric` per metrics values as `Point`).

I have extracted two examples, one for the default `http_reqs` metrics value that you can see below:

```json
{
  "metric": "http_reqs",
  "type": "Point",
  "data": {
    "time": "2024-03-19T18:59:30.714081-04:00",
    "value": 1,
    "tags": {
      "expected_response": "true",
      "group": "::Browse test.k6.io",
      "method": "GET",
      "name": "http://test.k6.io",
      "proto": "HTTP/1.1",
      "scenario": "default",
      "status": "308",
      "tag_key": "tag_value", // Our custom tag
      "url": "http://test.k6.io"
    }
  }
}
```

As you can see, between the default tags for the `http_reqs` metrics, we have our custom tag `tag_key: 'tag_value'`.
What's interesting, is that the test pass with an ultimate `200` as status code, yet on the metric we have a `308` which
is "_permanent redirect_". So it stores only the first response code, not the last one.

Now for the second example, here is what our custom trend metrics would look like:

```json
{
  "metric": "trend_tagged",
  "type": "Point",
  "data": {
    "time": "2024-03-19T18:59:31.837668-04:00",
    "value": 38.468,
    "tags": {
      "group": "::Browse test.k6.io",
      "scenario": "default",
      "tag_connection_time": "k6_website"  // Our custom tag
    }
  }
}
```

Much fewer tags are available since it's a custom metric. We have the one we defined as `tag_connection_time`,
plus the `group` and `scenario` tags that are added by default to all metrics.

And that's it for our overview of k6! 🎉

> Want to compare with other load testing tools? 🤔 Then check out:
> - [JMeter][20] which is Java-based
> - [Locust][21] which is Python-based

[1]: https://k6.io/
[2]: https://grafana.com/
[3]: https://grafana.com/load-testing/types-of-load-testing/
[4]: https://github.com/grafana/k6-template-typescript
[5]: https://babeljs.io/
[6]: https://webpack.js.org/
[7]: https://k6.io/docs/get-started/running-k6/
[8]: https://k6.io/docs/using-k6/test-lifecycle/
[9]: https://k6.io/docs/using-k6/scenarios/executors/
[10]: https://k6.io/docs/cloud/creating-and-running-a-test/cloud-tests-from-the-cli/
[20]: {% post_url 2020/2020-06-01-Jmeter-Load-Test-TCP %}
[21]: {% post_url 2019/2019-08-23-Load-Test-Locust %}