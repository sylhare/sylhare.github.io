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

If you already know it in Java then no suprise, but since you might be interested in Ktor or the kotlin syntax:

> You can have access to the source code at [sylhare/tcp](https://github.com/sylhare/tcp).

## Implementation

So I will put only snippets of the most simple relevant parts here.
You can always check the [source code]((https://github.com/sylhare/tcp)) later with much more example, tests and so on!

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

The Socket is that connection between the server and the client. A Socket has an input and a output. 
Depending on where you look at it, it does not mean the same thing because it a bidirectional link.
  - A _Server's input_ is the _client's output_.
  - A _Server's output_ is the _client's input_.
  
So basically you read from the input and write to the output. 
You work with Bytes, which might not be the best for your use case. 
For text you can use some wrapper:
  - To write and send text:
  
```kotlin
PrintWriter(socket.outputStream, true).write("text") 
  ```
  - To read bytes as text:
  
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


#### With real traffic

In order to test your client or server, you will need a server or a client in order to build a socket connexion, there's no magic.
In simple project you might think that your test code looks similar as your main code.
But as you develop new features, the test client / server should remain simple.

> You will need to run the server on a different thread!

Since you want the server to accept new connexion, you'll want to have it running on a different thread so that the tests can move on.
A very simple example could be if you had a `Server` object using what was shown before:

```kotlin
Thread(Runnable { Server().start(port = "1234") }).start()
```

The you can create your test with your client:

```kotlin
@Test
fun serverRespondsHelloClient() {
    client = Client()
    client.startConnection("localhost", "1234")
    Assertions.assertEquals("hello client", client.sendMessage("hello server"))
}
```

You create your `Client` object that would look like what was shown above. 
Connect it to the server running in the thread, send something and assuming that `sendMessage` methods return the received response,
you can assert on it.

That's a very simple use case, you might not want to return the response from the send message and depending if you're testing 
the client or the server you may go different ways to test the expected behaviour. 
Like creating having a `TestServer` or a `testClient` that will have some special `assertReceived` method for what you need to test.

#### With Mock

You could mock the socket but it can quickly get tedious and you'd be better off with a real socket client / server for your tests.
But you may want to use mock for corner cases or to decouple your client tests from your business logic tests.
 
Here if you'd like to simulate an Exception.
You would do that using [mockK](https://mockk.io/) in kotlin:

```kotlin
// Create a relaxed mock 
lateinit var mockClientSocket: Socket = mockk(relaxed = true)

// Set up the mock and test
@Test
fun uncaughtExceptionDummyTest {    
    every { socket.getOutputStream() } throws Exception()
    val client = SocketClient(socket = mockClientSocket)
    assertThrows<Exception> { client.write("data") }
}
```

The relaxed mock is used so you don't have to manually specify and mock all of the internals. Mockk will do it for you.
Obviously this test is just a dummy example, you don't want to let uncaught exceptions in your code.

## Using a framework: ktor

[Ktor](https://ktor.io/) is a framework for building asynchronous (coroutine) servers and clients in connected systems using Kotlin.
Made by the same people that made Kotlin.

Ktor in addition to HTTP handling, also supports client and server, TCP and UDP raw sockets.
It exposes a suspending API that uses NIO under the hoods.

You can check it out at [Raw Sockets Ktor example](https://ktor.io/servers/raw-sockets.html).

My only concern was that implementing the example, I had the warning that those `raw sockets` are still under
`@KtorExperimentalAPI` which means behaviour can still change in future release.
Other than that, it works 👍 
