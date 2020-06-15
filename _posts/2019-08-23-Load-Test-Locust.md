---
layout: post
title: Load test your application with Locust.
color: rgb(255, 111, 97)
tags: [python]
---

[Locust](https://locust.io/) is a python based tool to load test website, REST APIs and else.
You define the behavior of the tasks in python.
You can read the doc at [docs.locust.io](https://docs.locust.io/en/stable/).

## Installation

Make sure you have `libev` and install python dependencies (Work with Python 3.6):

```bash
brew install libev
pip install locustio
```

Or you can use the available [docker version](https://docs.locust.io/en/stable/running-locust-docker.html?highlight=docker).

## Create the load test

Create an example `load.py` which will contain the locust task:

```python
class LoadTasks(HttpLocust):
    host = url
    task_set = ExampleTaskSequence
    min_wait = 0
    max_wait = 1000
```


Then we can create an `ExampleTaskSequence` class with the different requests that will be used
in the load test.
Here let's use TaskSequence `@seq_task(1)` (with the number corresponding of the number in which they are going to be used) 
instead of a `@task(1)` where the number correspond to the weight of the task.

```python

class ExampleTaskSequence(TaskSequence):
    def __init__(self, parent):
        super().__init__(parent)
        self.token = create_token()

    @seq_task(1)
    def login(self):
        self.client.post(url, data={"payload":"payload"}},
                         headers=headers, name="login", auth=(username, password), verify=False)
    @seq_task(2)
    def disconnect (self):
        self.client.post(url, verify=False, auth=(username, password), name="disconnect")

```

To reduce the code size and for the sack of example some function are being called and defined else where.
The `name` in the `self.client` will be used in the summary in the locust graph instead of the url by default.
It works pretty much like `requests` so you can test your http command with it and straight copy / paste it in locust.

## Run the Load test

### Single instance

Use this command:

```bash
# Execute a loadTest
locust -f load.py LoadTask
```

You can start it with the locust GUI at [localhost:8089](localhost:8089)
The logs are generated in the terminal and there so you can check what is happening.

You can also run it without web interface using:

```bash
locust -f load.py LoadTask --no-web --clients=500 --hatch-rate=500
```
Where you specify:

  - `client`: Total number of simulated customer
  - `hatch-rate`: Number of new customer created per seconds until it reaches `client`


### Distributed

Locust run on one Thread, but you can run it on a distributed way with master and slaves.

Use this command to start the master:

```bash
locust -f load.py --master
```

The you can start as many slave as you CPU can, using:

```bash
locust -f load.py --slave --master-host=127.0.0.1
```

## Interpret the Data

{% include aligner.html images="locust.png" column=1 %} 

In Locust.
When you go in charts on the web UI, you'll see three of them:

- **Total requests per second**: 
  - Tracks the number of requests send per second during the load test time
- **Response time(ms)**:
  - Median (=50th percentile) in green: It means 50% of the user have a response time inferior or equal to the one said
  - 95th percentile in yellow: Represents the real traffic, 95% of your users will be under this response time.
- **Number of Users**: 
  - The number of active user created
  - It depends on the max number of users created at the start, and the hatch/second rate.
  
### Statistics definitions 

Let say we have these 12 response time for 12 requests that have been sent during one second:

```python
rt = [11, 12, 23, 24, 30, 31, 47, 48, 52, 53, 55, 57]
```

Out of that we can get for that second these statistical data:

- **Average**: The same as the mean, you take the sum of all response time divided by the number of request

```python
average = sum(rt) / len(rt)
>> 443 / 12 = 36.9
```

- **Median**: You take the value that is at half of your *ordered* data
  - For an odd number of data take the middle one (ex: 5, median is the value of the 3rd one - 1, 2, `3`, 4, 5)
  - For an even number of data take the mean of the middles one (ex: 4 median is the mean of the values of 2nd and 3rd one - 1, `2`, `3`, 4)

```python
median = (rt[5] + rt[6]) / 2  
>> (31 + 47) / 39
```

- **95th percentile**: The value at 95th percent of the dataset 
  - For a dataset of 100, the 95th percentile will be the 95th value from the ordered dataset. (..., 93, 94, `95`, 96, 97, 98, 99, 100.)

```python
percentile = rt[int(round(0.95 * len(rt)) - 1)]  
>> rt[10] = 55 # for the 11th element of the list
```
