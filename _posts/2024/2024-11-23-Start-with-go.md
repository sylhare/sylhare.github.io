---
layout: post
title: On the path to being a Go Developer
color: rgb(0 125 156)
tags: [go]
---

Everything you need to know about Go to get started!
Let's have a look at what [go][1] has to offer, some of the quirks, the syntax and some tips.
This is assuming you have installed go, but you didn't look too much into the documentation.
Talking about documentation, the [tour][5] is a great place to start for interactive examples.

Let's have an overview of what you could have missed, but first, let's remind ourselves how to run the code. 

### I. Run it!

Create a new file named `main.go`.

```go
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
```

It needs to have a `package main` declaration at the top,
as the `main` function in that package is the entry point of the program.
The `import "fmt"` statement is used to import the `fmt` package, which is used to print messages to the console.

To run a Go file, you can use the `go run` command.

```bash
go run main.go
```

This will compile and run the `main.go` file.
To build an executable, you can use the `go build` command.

```bash
go build main.go
```

This will create an executable file named `main`.

### II. Assigning in Go

#### 1. Variables

Variables in Go are used to store values.
They are used to store values that can change during the execution of the program.
You need to specify the type of the variable when you declare it.

```go
var a int
a = 1
fmt.Println(a)
```

You can also declare and initialize a variable at the same time.

```go
b := 2
fmt.Println(b)
```

#### 2. Constants

Constants in Go are values that don't change.
They are used to define values that are known at compile time.

```go
const Pi = 3.14159
```

#### 3. Ignoring values

You can assign multiple variables at once in Go, and ignore those you don't need.

```go   
_, b := 1, 2
```

It will ignore the first value and assign `2` to `b`.
This pattern is used when you need to explicitly ignore return values from a method.

#### 4. Pointers

Pointers are a way to pass a reference to a value.
They are used to avoid copying large values.

```go
func Modify(a *int, b int) (int, int) {
    *a += 1
	b += 1
    return *a, b
}
```

Now you can call the `Modify` function with pointers.
> The `*a` returns the value `int` instead of a pointer `*int`.

This will copy the value of `b` and pass a reference to `a` and return the value of each increased by 1.

```go
a, b := 2, 2
fmt.Println(Modify(&a, b)) // 3, 3
fmt.Println(a, b)          // 3, 2
```

And as you can see, both return the same thing,
however the value of `a` has been changed while the value of `b` remained the same!

### III. Data structures

#### 1. Structs

Structs are a way to define a type that groups together fields.
They are similar to classes in other languages, as such they can have methods and implement interfaces.
(we'll have a look at that in more details, keep scrolling down 🤓).

```go
type Person struct {
    Name string
    Age  int
}
```

Now you can create a `Person` type.

```go
p := Person{Name: "Alice", Age: 30}
fmt.Println(p.Name)
```

#### 2. Slices

Slices are a way to represent a sequence of values.
They are similar to arrays, but they are more flexible.

```go
s := []int{1, 2, 3}
fmt.Println(s[0])
```

You can append values to a slice.

```go
s = append(s, 4)
fmt.Println(s)
```

The difference between a Slice and an Array is that an Array has a fixed size (e.g. an array of size 3 `var arr [3]int`),
while a Slice can grow or shrink.
A Slice is a reference to an underlying array, so when you append a value to a Slice, 
it might create a new array and copy the values.

#### 3. Maps

Maps are a way to represent a collection of key-value pairs.
They are similar to dictionaries in other languages.

```go
m := map[string]int{
    "one": 1,
    "two": 2,
}
fmt.Println(m["one"])
```

You can add values to a map.

```go
m["three"] = 3
fmt.Println(m)
```

### IV. Errors

Error handling in Go is a bit different from other languages.
It uses the `error` type to represent an error.

```go
err := doSomething()
if err != nil {
    log.Fatal(err)
}
```

The downside is that the error checking can become a bit bulky.
You can reduce the size using this syntax:

```go
if err := doSomething(); err != nil {
	log.Fatal(err)
}
```

The `log.Fatal` function will print the error message and stop the program with a non-zero exit code.

### V. Functions

#### 1. Named return values

Named return values are a way to define the return values of a function.
They are used to make the code more readable.

```go
func Add(a, b int) (sum int) {
    sum = a + b
    return
}
```

The return value is called `sum`, and it is automatically returned by the function.
That's why you don't need to specify it in the `return` statement.

It can also be used to return multiple values and empty values.

```go
func example() (hello string, error error) {
    if err := doSomething(); err != nil {
        return
    }
    return "hello", nil
}
```

No need to specify `""` when there's an error, it will do it be default for the _hello_ returned value.

#### 2. Using a function from another package

To use a function from another package, you need to import it.
You can import a package using the `import` keyword.

```go
import (
	"fmt"
    "src/pkg/example"
)

func main() {
	fmt.Printf("1 + 2 = %d", example.Add(1, 2))
}
```

Since the method `Add` is capitalized, it's exported and can be used outside the package.
To use it in main, I can use it since it's in my `import` like the built-in [fmt][2] package.

#### 3. Defer

Defer is a keyword in Go that allows you to delay the execution of a function until the surrounding function returns.

```go
func main() {
    defer fmt.Println("world")
    fmt.Println("hello")
}
```

In this example, the `world` message will be printed after the `hello` message.

### VI. Interfaces

Go doesn't have classes, but it has interfaces.
Interfaces are a way to define a set of methods that a type must implement.

```go
type Handler interface {
    Handle()
}
```

Now you can create a type that implements the `Handler` interface.

```go
type UserHandler struct{}

func (h UserHandler) Handle() {
    fmt.Println("hello")
}
```

As you can see, the `UserHandler` type implements the `Handle` method.
It is implicitly implementing the `Handler` interface.
The `(h UserHandler)` is the receiver of the method. A receiver is a way to attach a method to a type.
It is similar to `this` in JavaScript or `self` in Python.

Let's create our handler and call the `Handle` method:

```go
handler := UserHandler{}
handler.Handle()
```

Only functions with *Capitalized names* are exported, so they can be used outside the package.

### VII. Goroutines

#### 1. Introduction 

Goroutines are lightweight threads managed by the Go runtime.
They are used to run functions concurrently.

```go
go fmt.Println("hello 1")
```

You can use it to run functions concurrently using the `go` keyword.
If you want or need to wait for the goroutine to finish, 
you can use a `sync.WaitGroup` to defer the wait group's done so it waits for the goroutine execution.

```go
func main() {
	var wg sync.WaitGroup

	wg.Add(1) // Increment goroutine to wait for
	go func() {
		defer wg.Done() // Decrement the counter when it's done
		fmt.Println("hello 2")
	}()

	wg.Wait() // Wait for all goroutines to finish
}
```

Or you can use a channel.

#### 2. Channels

Channels are a way to communicate between goroutines.
They are used to send and receive values between goroutines.

```go
ch := make(chan int)
go func() { ch <- 42 }()
fmt.Println(<-ch)
```

This will wait for the goroutine to send a value to the channel and then print it.

#### 3. Select

Select is a way to wait for multiple channels to send values.
It allows you to wait for multiple channels to send values based on the first received one:

```go
ch1 := make(chan int)
ch2 := make(chan int)
go func() { ch1 <- 43 }()
go func() { ch2 <- 44 }()
select {
case v1 := <-ch1:
    fmt.Println(v1)
case v2 := <-ch2:
    fmt.Println(v2)
}
```

It will print either 42 or 43 based on which channel sends a value first.
The _Select_ only execute one case, so it won't print both numbers.

#### 4. Context

You can use the context here to cancel the goroutine, but it's not limited to goroutines.
Let's create a context with cancel for our example derived from the application context.

```go
ctx, cancel := context.WithCancel(context.Background())
go func() {
    <-ctx.Done()
    fmt.Println("done")
}()
cancel()
```

The `<-` blocks the goroutine's execution until the context is done and the `cancel` function is called.
When we call the `cancel` function, it will let the goroutine execute and print `done`.

The context becomes useful when used in an API call.
It can hold information regarding the request, like the user, the request ID.
For example if the user logs out, you can cancel the context and stop the request.

### VIII. Testing

#### 1. Introduction

Test files in go are named `*_test.go`, they are usually placed right next to the file they are testing, 
in the same package.

```coffee
main.go
main_test.go
```

To run the tests in the current package, you can use the `go test` command.

```bash
go test
```

To run all the tests in all the packages, you can use the `go test ./...` command.

#### 2. Write a test

Testing in Go is done using the [testing][3] package.
It allows you to write tests for your code and run them using the `go test` command.

```go
func Add(a, b int) int {
    return a + b
}
```

And now the test:

```go
func TestAdd(t *testing.T) {
    result := Add(1, 2)
    if result != 3 {
        t.Errorf("Add(1, 2) = %d; want 3", got)
    }
}
```

If the test pass, or in this case, doesn't error out, it will simply output `PASS` in the console with the test name.

#### 3. Using an assertion library

There's no default assertion library in Go, it just prints the error message and stops the test.
You can use the external library [testify][4] to have more advanced assertions.

```go
import (
    "github.com/stretchr/testify/assert"
    "testing"
)

func TestAdd(t *testing.T) {
  assert.Equal(t, 3, Add(1, 2))
}	
```

To make it a test function, it must be named `Test*`, have a `*testing.T` parameter and be in a file named `*_test.go`.
As you can see the function's first letter is capitalized however it can't be exported to other packages.
So helper test functions for multiple packages need to have their proper package and file.

#### 4. Benchmarking

Benchmarking in Go is done using the `testing` package.
It allows you to write benchmarks for your code and run them using the `go test -bench` command.

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(1, 2)
    }
}
```

This will run the `Add` function `b.N` times and measure the time it takes to run it.

```shell
BenchmarkAdd
BenchmarkAdd-8   	1000000000	         0.5165 ns/op
```

The prefix of the test matters as it's what's make it a benchmark test.
The above output shows that the `Add` function runs in `0.5165 ns/op` which means it runs in `0.5165 nanoseconds` per operation!
The number of operations is defined by the `b.N` value.



[1]: https://go.dev/
[2]: https://pkg.go.dev/fmt
[3]: https://pkg.go.dev/testing
[4]: https://pkg.go.dev/github.com/stretchr/testify
[5]: https://go.dev/tour/basics/1