---
layout: post
title: Load test 🥊 on tcp with jmeter
color: rgb(249, 103, 20)
tags: [java]
---

The [Apache JMeter™](https://jmeter.apache.org/index.html) application is open source software, a 100% pure Java application designed to load test functional behavior and measure performance. 
It was originally designed for testing Web Applications but has since expanded to other test functions. 

## Installation

With mac, to install [apache](https://jmeter.apache.org/usermanual/) JMeter:

```bash
brew install jmeter
```

## Configuration

### Variable

JMeter files can leverage [variables](https://jmeter.apache.org/usermanual/functions.html) in order to update your load test on the fly:

```bash
${__P(host, localhost)}
```

Here I am defining the variable `host` with a default value of `"localhost"`. 
This variable can be overwritten in the command line using:

```bash
jmeter -n -t LoadTestJmeterScript.jmx -Jhost=192.168.0.1
```

So that the host will be _192.168.0.1_ during the load test.
You can define all of your default variable within a *TCP Sampler Config* that will apply on all the subsequent Sampler.
Also you can configure your Thread Group number of Thread and duration adding variables to it.
When using with duration you should use "Infinite Loop". 


### Create your Sampler

You can find excellent tutorial on [Blazemeter](https://www.blazemeter.com/blog/how-load-test-tcp-protocol-services-jmeter) 
or [Dzone](https://dzone.com/articles/how-to-load-test-tcp-protocol-services-with-jmeter) with screenshot and detailed examples.
There some options available in your Sampler:

{% include aligner.html images="jmeter-sampler.png" column=1 %}

- The timeout parameter:
  - _Connect_: max time in ms for the Sampler to wait for the connection to be established.
  - _Response_: max time the sampler will wait for a response from the request.
  
- The other connection parameters:
  - _Re-use connection_: To re use the same connection previously established to send data
  - _Close connection_: To open and close the connection each time it sends data.
  - _Set NoDelay_: When set small messages, even those the size of only 1 byte, are sent in a separate packet. Otherwise, if this parameter is cleared, a number of small messages is combined in one packet before sending them.
  - _SO_LINGER_: This option can be enabled in the socket to cause the script to block the close the connection call for a number of seconds, specified in this field, until all final data is delivered to the destination station.
  - _EOL byte value_: Tells which is the last byte to expect (So it knows when it got all of the response, otherwise it will timeout with Error: 500)

{% include aligner.html images="jmeter-test-plan.png" %}

You can add a TCP Sampler and then add some other things to it like:
 - _Response Assertion_: To assert on the response data of the request (Because TCP does not return HTTP - 200, you need to add something to say when it's a success)
 - _View Results Tree_: To check what has been send and received for the particular sampler
 - _BeanShell PreProcessor_: To custom the request you are going to send (Uses BeanShell syntax)
 
If you want the combined results of your Thread Group. You will want to use a _Summary Report_.
Add a filename to it like "performance.csv" so it will be generated at each run.

{% include aligner.html images="jmeter-summary.png" column=1 %} 

You can add other _Listeners_ to your Thread Group for assertions or even a graph.
To generate a report, see the command line in the next section.


## Usage 

Run the load test for 100 tps:
```bash
jmeter -f -n -t LoadTestTcp.jmx -Jthreads=100 -Jhost=localhost -Jport=5556 -l output.jtl
```

The result of the load test will be saved:

 - in `output.jtl` for the load test values
 - in `jmeter.log` for the logs of jmeter 
 - in `performance.csv` for the csv with all of the requests (a bit like the output.jtl)
 
To turn the csv/jtl file into an html in the _report_ folder, use:

```bash
jmeter -g output.jtl -o report
jmeter -g performance.csv -o report
```

This will [generate a report](https://jmeter.apache.org/usermanual/generating-dashboard.html) that you can open in your browser.
 
{% include aligner.html images="jmeter-report.png" column=1 %} 

You will get access to all the information you need (timestamp, transaction/s, request average or median time, results, etc ...)
