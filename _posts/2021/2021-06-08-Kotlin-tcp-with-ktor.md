---
layout: post
title: Implement TCP in Kotlin with ktor 
color: rgb(169,123,255)
tags: [kotlin]
---

[Ktor](https://ktor.io/) is a framework for building asynchronous (with coroutine) servers and clients in Kotlin.
It's made by the same people that made Kotlin.

If you would rather not use a framework, you can check this article on [How to use Kotlin for TCP with java sockets]({% post_url 2020/2020-04-07-Kotlin-tcp-socket-example %})

## Using Ktor framework

Ktor in addition to HTTP handling, also supports client and server, TCP and UDP raw sockets.
It exposes a suspending API that uses NIO (Java New-IO for [non-blocking I/O](https://en.wikipedia.org/wiki/Non-blocking_I/O_(Java))) under the hoods.

You can check there example: [Raw Sockets Ktor example][1].

It still a bit experimental, but it should be good to go _soonish~~_

## Add the dependencies

Use Kotlin 1.4 and ktor 1.6.0, add it to your `build.gradle.kts`:

```kotlin
plugins {
    kotlin("jvm") version "1.4.32"
}

dependencies {
    implementation("io.ktor:ktor-server-netty:1.6.0")
    implementation("io.ktor:ktor-network:1.6.0")
}
```

The newer version of ktor requires `ktor-network` in order to use the [raw sockets][1].


## Implementation

Let's look at a simpler example with one call-flow between the server and the client.
Here is the code:

### Server

The server is running on port `2323` and write back what the connected client sent.
Unlike the ktor [example][1], this one is not multi-bind.

```kotlin
suspend fun server() {
    val server = aSocket(ActorSelectorManager(Dispatchers.IO)).tcp()
        .bind(InetSocketAddress("127.0.0.1", 2323))
    println("Server running: ${server.localAddress}")
    val socket = server.accept()
    println("Socket accepted: ${socket.remoteAddress}")
    val input = socket.openReadChannel()
    val output = socket.openWriteChannel(autoFlush = true)
    val line = input.readUTF8Line()

    println("Server received '$line' from ${socket.remoteAddress}")
    output.writeFully("$line back\r\n".toByteArray())
}
```

It's a `suspend` function because ktor is actively using coroutine, so this run blocking bit of code needs to be in an asynchronous call (⇰ in a coroutine).
I added some line to be printed in the terminal to witness the transaction 👀

### Client

This client will connect to the server above and send `hello`.
Then it will wait for the server's response and print it in the log.

```kotlin
suspend fun client() {
    val socket = aSocket(ActorSelectorManager(Dispatchers.IO)).tcp()
        .connect(InetSocketAddress("127.0.0.1", 2323))
    val input = socket.openReadChannel()
    val output = socket.openWriteChannel(autoFlush = true)

    output.writeFully("hello\r\n".toByteArray())
    println("Server said: '${input.readUTF8Line()}'")
}
```

The `autoFlush` for the output means that the data doesn't wait in the buffer, it goes through it, gets sent and then flushed out.
Usually in TCP you can have a buffer to accumulate the data and wait until a packet size to send it. 

Since `"hello"` is relative small in terms of bytes, without `autoFlush` it could get "stucked" in the buffer and not being sent.

### Run them both

Since kotr uses coroutine we'll use it to start our server that will run in the background, 
however for the client we will use [`runBlocking`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html) 
which will start the client in a new blocking coroutine to wait and the see the transaction being made.


```kotlin
fun main() {
    CoroutineScope(Dispatchers.Default).launch { server() }
    runBlocking { client() }
}
```

When you run them, the client will send a message, 
the server will respond, and you should see something like this:

```
Server running: /127.0.0.1:2323
Socket accepted: /127.0.0.1:56215
Server received 'hello' from /127.0.0.1:56215
Server said: 'hello back' 
```

You can see that it's running on localhost (127.0.0.1) and that the socket's ip has a random port `56215`.
Now you should have mastered the basics of socket communication with ktor.

Find more examples on their documentation like this [simple echo server](https://ktor.io/docs/servers-raw-sockets.html#simple-echo-server)

If you like this article or have a question, you can upvote ⬆️ or drop a comment ✍️ on the original [stackoverflow answer](https://stackoverflow.com/a/67845809/7747942)! 💬

[1]: https://ktor.io/docs/servers-raw-sockets.html "ktor raw socket"
