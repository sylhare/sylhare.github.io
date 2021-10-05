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

If you already know it in Java then no surprise, but since you might be interested in Ktor or the kotlin syntax:

> You can have access to the source code at [sylhare/tcp](https://github.com/sylhare/tcp).

## Implementation

So I will put only snippets of the most simple relevant parts here.
You can always check the [source code](https://github.com/sylhare/tcp/tree/master/src/main/kotlin/tcp/examples) later with much more example, tests and so on!

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
  
However once the connection is established ie the client socket is created and connected to the server.
Then bytes exchange can flow.

### Socket

The Socket is that connection between the server and the client. A Socket has an input and a output. 
Depending on where you look at it, it does not mean the same thing because it is a bidirectional link.
  - A _Server's input_ is the _client's output_.
  - A _Server's output_ is the _client's input_.
  
So basically you read from the input and write to the output. 
You work with Bytes, which might not be the best for your use case. 
For text, you can use some wrapper:
  - To write and send text:
  
```kotlin
PrintWriter(socket.outputStream, true).write("text") 
  ```
  - To read bytes as text:
  
```kotlin
val text = BufferedReader(InputStreamReader(socket.inputStream)).readLine()
```

The _write_ is pretty straightforward, you can `flush` the outputStream meaning to forcefully send whatever is in the pipe at that moment.
The reader requires a buffer, which it will use to copy the read bytes into it.

### Multi bind 

To create one server that will be able to have binds with multiple clients.
A bind is the same as a socket connection.

Oracle documentation about [TCP Client Server](https://docs.oracle.com/javase/tutorial/networking/sockets/clientServer.html)
sum it up quite well:

```kotlin
while (true) {
    val socket = server.accept()            // accept a connection
    Thread{ handleClient(socket) }.start()  // create a thread to deal with the client
}
```

This infinite loop will be on stand by and wait for a socket connection at `server.accept()`.
The handleClient will use the socket to exchange data with the client. 

### Put it all together

#### Client
Let's create a simple client that will send a message to a server:

```kotlin
fun client() {
    val client = Socket("127.0.0.1", 9999)
    val output = PrintWriter(client.getOutputStream(), true)
    val input = BufferedReader(InputStreamReader(client.inputStream))

    println("Client sending [Hello]")
    output.println("Hello")
    println("Client receiving [${input.readLine()}]")
    client.close()
}
```

#### Server

Now we create a server that will respond to the received message.
This is usually call an echo server.

```kotlin
fun server() {
    val server = ServerSocket(9999)
    val client = server.accept()
    val output = PrintWriter(client.getOutputStream(), true)
    val input = BufferedReader(InputStreamReader(client.inputStream))

    output.println("${input.readLine()} back")
}
```

#### Output

Let's run both at the same time to see the client's log:

```kotlin
fun main() {
    Thread{ server() }.start()
    client()
}
```

We need to start the server in a Thread so that the client will run too.
We send only one message then the program stops:

```
Client sending [Hello]
Client receiving [Hello back]
```

The client receives its response from the server. 
As you may see a server and a client are not very different.

To make the server _multi bind_ you would just need to put everything, but the first line in an infinite loop.

### Testing

For testing a connection and your tcp server, client.
You have a wide range of possibilities.

#### With real traffic

In order to test your client or server, you will need a server, or a client in order to build a socket connexion, there's no magic.
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

That's a very simple use case, you might not want to return the response from the _sendMessage_ and depending on if you're testing 
the client, or the server you may go different ways to test the expected behaviour. 
Like creating having a `TestServer` or a `testClient` that will have some special `assertReceived` method for what you need to test.

#### With Mock

You could mock the socket, but it can quickly get tedious, and you'd be better off with a real socket client / server for your tests.
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

The relaxed mock is used, so you don't have to manually specify and mock all the internals. Mockk will do it for you.
Obviously this test is just a dummy example, you don't want to let uncaught exceptions in your code.

## Post Scriptum

I updated this article seeing someone had trouble following it and opened a question on [stackoverflow](https://stackoverflow.com/a/67845608/7747942).
So I answer and updated this article 😃 

If you want to be a truly majestic person, you can always go ⬆ upvote [the answer](https://stackoverflow.com/a/67845608/7747942).
You nice lovely papayas 🧡 
