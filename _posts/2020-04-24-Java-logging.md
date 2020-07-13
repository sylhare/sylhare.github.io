---
layout: post
title: Logging with Java or Kotlin
color: rgb(249, 103, 20)
tags: [java, kotlin]
---


## Logging

In your software, you want to log information for troubleshooting and make sure that everything behaves as 
it should. And in case an error occurred, to be able to find the root cause looking at the logs.

There a multiple logging levels, here some you would encounter with logging frameworks:
   - TRACE: the most detailed informational events.
   - DEBUG: fine-grained informational events that are most useful to debug an application.
   - INFO: informational messages that highlight the progress of the application.
   - WARN: potentially harmful situations.
   - ERROR: error events.


## SLF4J for logging facade

SLF4J is the Simple Logging Facade for Java ([SLF4J](http://www.slf4j.org/manual.html)) serves as a simple facade or abstraction for various logging frameworks (e.g. java.util.logging, logback, log4j) allowing the end user to plug in the desired logging framework.
As name suggest it is a [facade library](https://medium.com/@krishankantsinghal/logback-slf4j-log4j2-understanding-them-and-learn-how-to-use-d33deedd0c46) which provide abstraction for logging libraries like 
`log4j`, `logback` , `java.util.logger` and don't do actual logging.
It acts as an interface so you switch easily for any logging library.


### Bridge Handler

Logger from `java.util.logging.Logger` (j.u.l.) needs to be bridged to with the slf4j handler.
You need in your _build.gradle.kts_:

```kotlin
implementation("org.slf4j:jul-to-slf4j:1.7.28")
```

Then you can use it like:

```kotlin
    import org.slf4j.bridge.SLF4JBridgeHandler

    SLF4JBridgeHandler.removeHandlersForRootLogger()
    SLF4JBridgeHandler.install()
```

If used with logback, to be able to propagate its configuration, 
you need to add this in your _logabck.xml_ to reset J.U.L (Java Util Logger):


```xml
    <contextListener class="ch.qos.logback.classic.jul.LevelChangePropagator">
        <!-- reset all previous level configurations of all j.u.l. loggers -->
        <resetJUL>true</resetJUL>
    </contextListener>
```

## Logback

[Logback](http://logback.qos.ch/) is a logging framework for Java applications. 
The Logback project is [organized](https://stackify.com/logging-logback/) in main 3 modules:

   - logback-core: contains the basic logging functionality
   - logback-classic: contains additional logging improvements, such as slf4j support
   - logback-access: provides integration with servlet containers, such as Tomcat and Jetty

You may want to add those dependencies inside your _build.gradle.kts_ depending on your needs.

```kotlin
    implementation("ch.qos.logback:logback-classic:1.2.3")
    implementation("ch.qos.logback:logback-core:1.2.3")
```

### Logback.xml

You use a `logback.xml` to specify the logback configuration, here is a basic [example](https://www.javacodegeeks.com/2012/04/using-slf4j-with-logback-tutorial.html).
The file should be located in your resources folder.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>
                %d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n
            </Pattern>
        </layout>
    </appender>

    <logger name="com.example" level="debug" additivity="false">
        <appender-ref ref="CONSOLE"/>
    </logger>

    <root level="error">
        <appender-ref ref="CONSOLE"/>
    </root>

</configuration>
```

You can also do all that configuration in java/kotlin code.
To debug your configuration and show logback logs, you can add in the `<configuration>` tag a `debug="true"`.
You usually add a `logback-test.xml` for your tests.

All loggers are descendants of the predefined [root logger](https://www.baeldung.com/logback#create_context).

### Start logging

Logback [documentation](http://logback.qos.ch/manual/introduction.html) to get started.
Here how it would look in your kotlin code:

```kotlin
import org.slf4j.LoggerFactory

val logger = LoggerFactory.getLogger(this::class.java.canonicalName)
logger.info("Hello world.")
```

And the output in the console:

```bash
> 12:49:22.203 [main] INFO io.github.sylhare.hello - Hello world.
```

### Appender

The loggers forward LoggingEvents to Appender. Logback-core provides several useful [appender](https://mkyong.com/logging/slf4j-logback-tutorial/).
Appender do the actual work of logging. 
We usually think of logging as something that goes to a file or the console, but Logback is capable of much more.

#### ConsoleAppender

Despite its name, ConsoleAppender appends messages to System.out or System.err.
That's why it's often named "_STDOUT_" because that's where the messages will be redirected.


```xml
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>
                %d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n
            </Pattern>
        </layout>
    </appender>
```

#### FileAppender

FileAppender appends logs to a file. You can have them log in a single file, or use a rolling appender
that will save your logs on multiple files based on your configuration

##### Singe File


FileAppender use `<file>` to specify the filename, the logs will be saved in. 
The `<append>` tag instructs the Appender to append messages to existing file rather than truncating it.


```xml
<appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <file>testFile.log</file>
    <append>true</append>
    <encoder>
      <pattern>%-4relative [%thread] %-5level %logger{35} - %msg%n</pattern>
    </encoder>
 </appender>
```

#### Rolling Appender

RollingFileAppender rotate log file, by date and size:

  - _fileNamePattern_: how the name of the logs will be formatted
  - _maxFileSize_: Max size of each archived file
  - _totalSizeCap_: total size of all archive files, here set to 20GB so if total size > 20GB, it will delete old archived file
  - _maxHistory_: here set to 60, so 60 days to keep 
  
Here `<file>` is used to specify the home directory of the logs. 

```xml
    <appender name="FILE-ROLLING" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_DIR}</file>

        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/archived/app.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <!-- each archived file, size max 10MB -->
            <maxFileSize>10MB</maxFileSize>
            <!-- total size of all archive files, if total size > 20GB, it will delete old archived file -->
            <totalSizeCap>20GB</totalSizeCap>
            <!-- -->
            <maxHistory>60</maxHistory>
        </rollingPolicy>

        <encoder>
            <pattern>%d %p %c{1.} [%t] %m%n</pattern>
        </encoder>
    </appender>
```

As you can it uses a variable `${HOME_LOG}` that can pass through system properties, or directly when 
running your application.

```bash	
$ java -DLOG_DIR=/var/log/app app.jar
```

Or adding a property tag like that:

```xml
<property name="LOG_DIR" value="/var/log/application" />
```


### AsyncAppender

AsyncAppender logs asynchronously, faster, 
but drop events of level TRACE, DEBUG and INFO if its queue is 80% full, keeping only events of level WARN and ERROR.
 
Appender are cumulative, to avoid duplicated logs, you can use additivity=false.
You can also use reference to other appender for logging different modules, classes or levels.

```xml
<configuration>
    <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="STDOUT" /> <!-- given you have defined the STDOUT appender -->
        <queueSize>10000</queueSize>
    </appender>
    
    <logger name="transactions" level="info" additivity="false">
            <appender-ref ref="ASYNC"/>
    </logger>
</configuration>
```

### Encoder and Layout


#### Logstash encoder 

[Logstash](https://www.elastic.co/logstash) from _elastic_ is an open source, server-side data processing pipeline that ingests data from a multitude of sources simultaneously, 
transforms it, and then sends it to your favorite "stash."

You can use the logstash encoder which provides logback encoders, layouts, and appender to log in JSON and other formats supported by Jackson.

```kotlin
implementation("net.logstash.logback:logstash-logback-encoder:6.2")
```

Here an example in a ConsoleAppender:

```xml
<appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <file>testFile.log</file>
    <append>true</append>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <pattern>%-4relative [%thread] %-5level %logger{35} - %msg%n</pattern>
    </encoder>
 </appender>
```


#### Layout

Layout is responsible for transforming an incoming LoggingEvents into a String. PatternLayout is included in Logback. 
It implements a large variety of conversion words and format modifiers for creating patterns. 
It recognizes conversion words with a %. Here are some commonly used conversion patterns:

  - `%d{HH:mm:ss.SSS}`: a timestamp with hours, minutes, seconds and milliseconds
  - `%date{ISO8601}`: a date with ISO 8601 format
  - `[%thread]`: the thread name generating the log message, surrounded by square brackets
  - `%-5level`: the level of the logging event, padded to 5 characters
  - `%logger{36}`: the class name the log message occurred in. The number inside the brackets represents the maximum length of the package plus the class name. If the output is longer than the specified length, it will take a substring of the first character of each individual package starting from the root package until the output is below the maximum length. The class name will never be reduced
  - `%msg%n`: the actual log messages followed by a new line
