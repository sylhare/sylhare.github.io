---
layout: post
title: Kotlin tcp with java sockets 🧦
color: rgb(214,102,133)
tags: [kotlin]
---


We will be using the default java sockets to create a tcp server/client with Kotlin:

```kotlin
import java.net.ServerSocket
import java.net.Socket
```

You can have access to the source code at [sylhare/tcp](https://github.com/sylhare/tcp).

## Implementation

### Server and Client

There are two concepts here:
  - A server accepts clients connection. 
    ```kotlin
    val server = ServerSocket(9999)
    val socket = server.accept()
    ``` 
  - A Client looks for a server to establish a connection.
    ```kotlin
    val socket = Socket("localhost", 9999)
    ```
  
However once the connection is establish ie the client socket is created and connected to the server.
Then bytes exchange can flow.

### Socket

The Socket is that connection between the server and the client.
  - Server's socket input is client's socket output.
  - Server's socket output is client's socket input.
  
So basically you read from the input and write to the output. 
You work with Bytes, which might not be the best for your use case. 
For text you can use some wrapper:
  - to write and send text:
  ```kotlin
  PrintWriter(socket.outputStream, true).write("text") 
  ```
  - to read bytes as text
  ```kotlin
  val text = BufferedReader(InputStreamReader(socket.inputStream)).readLine()
  ```
The write is pretty straightforward, you can `flush` the outputStream meaning to forcefully send whatever is in the pipe at that moment.
The reader requires a buffer, which it will use to copy the read bytes into it.

### Multi bind 

When you have one server that needs to accept multiple clients.
Oracle documentation about [TCP Client Server](https://docs.oracle.com/javase/tutorial/networking/sockets/clientServer.html)
sum it up quite well:

```kotlin
while (true) {
    val socket = server.accept()            // accept a connection
    Thread{ handleClient(socket) }.start()  // create a thread to deal with the client
}
```

### Testing

For testing a connection, and your tcp server, client.
You have a wide range of possibilities. 

You can either mock the `socket` and the connection to test the logic 
behind the reading and writing of the data, everything is handled well.
You would do that using [mockK](https://mockk.io/) in kotlin

```kotlin
    // Create a mock
    @MockK
    lateinit var mockClientSocket: Socket
    
    // Set the mock up using real OutputStream and InputStream
    fun setup() {
        every { mockClientSocket.getOutputStream() } returns output
        every { mockClientSocket.getInputStream() } returns input
    }
```

Create a real mock server / client that will send the data. With this, you can create a real connection 
and add some methods to control what is being sent and if it's received back. 
However for simple use case your test client / server might be real close to your main code.


## Using a framework: ktor

[Ktor](https://ktor.io/) is a framework for building asynchronous (coroutine) servers and clients in connected systems using Kotlin.
Made by the same people that made Kotlin.

Ktor in addition to HTTP handling, also supports client and server, TCP and UDP raw sockets.
It exposes a suspending API that uses NIO under the hoods.

You can check it out at [Raw Sockets Ktor example](https://ktor.io/servers/raw-sockets.html).

My only concern was that implementing the example, I had the warning that those `raw sockets` are still under
`@KtorExperimentalAPI` which means behaviour can still change in future release.
Other than that works 👍 
