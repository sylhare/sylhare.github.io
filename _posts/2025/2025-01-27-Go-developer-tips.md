---
layout: post
title: Fun, tips and facts for Go developers
color: rgb(89, 124, 179)
tags: [go]
---

Here is a list of Go random facts, tips and information I thought of bundling together, as a follow-up to my [previous article][20].
In the mix, some pattern may conflict with my go peers, which makes the whole thing more flamboyant. 
Who doesn't love passionate debate ? I documented what made sense to me. 

## Using a version manager

A version manager is a tool that allows you to install and switch between different versions of Go.

I tried [gvm][1] (Go Version Manager) which is inspired by `rvm` for Ruby, but it was some hacky overrides of
terminal commands like `cd` to check the go version on each directory change.
It's been as of now 2years without commit, so not very maintained,
I like the idea of a go version manager, but not the implementation of `gvm`

There are other alternative like [goenv][2],
but in the end I kept it simple with the [official way][3] of managing multiple go versions using `go install`

| Task            | Command                                                       |
|-----------------|---------------------------------------------------------------|
| Install version | `go install golang.org/dl/go1.X.Y@latest && go1.X.Y download` |
| Use version     | `GOTOOLCHAIN=local go1.X.Y <command>`                         |
| Check installed | `ls ~/sdk/`                                                   |
| Remove version  | `rm -rf ~/sdk/go1.X.Y`                                        |

Modern Go (1.21+) has automatic toolchain management that can upgrade versions.
It introduced this env variable that controls which Go toolchain version is used to run your commands,
use `GOTOOLCHAIN=local` to use the exact installed version.

## Init function

The `init` function is a special function in Go that is called when the package is imported.
It cannot be called explicitly and is used to initialize package-level variables or perform setup tasks before `main()`
is called.

```go
package main

import "fmt"

var hello string

func init() {
  fmt.Println("init called")
  hello = "world!"
}

func main() {
	fmt.Printf("main called %s\n", hello)
}
```

This will output:

```shell
init called
main called world!
```

You can have multiple `init` function in a package,
but the ordering will be determined by the order of appearance in the files. Which is not necessarily obvious.
Don't use it for complex setting up, prefer explicit initialization functions.
It will be easier to read and test.

### Pointer Receiver vs Value Receiver in Go

In Go, methods can have either a **pointer receiver** or a **value receiver**, and the choice between them depends on the behavior you want to achieve.

#### Value Receiver

- A value receiver operates on a **copy** of the struct.
- Changes made inside the method do not affect the original struct.
- Suitable for small structs or when the method does not need to modify the struct.

Example:
```go
type User struct {
    Name string
}

func (u User) Greet() string {
    return "Hello, " + u.Name
}

func main() {
    user := User{Name: "Alice"}
    fmt.Println(user.Greet()) // Output: Hello, Alice
}
```

#### Pointer Receiver

- A pointer receiver operates on the **actual struct**, allowing the method to modify the original `struct`'s fields.
- It avoids copying the struct, which is more efficient for large structs.
- Pointer receivers can also handle **nil receivers**, meaning the method can be called even if the struct is `nil`.

Example:
```go
type User struct {
    Name string
}

func (u *User) Greet() string {
    if u == nil {
        return "Hello, Guest"
    }
    return "Hello, " + u.Name
}

func main() {
    var user *User // user is nil
    fmt.Println(user.Greet()) // Output: Hello, Guest
}
```

#### Pointer vs Non-Pointer Receivers

When you use a value receiver, Go creates a copy of the struct every time the method is called,
which can be inefficient for large structs or containing complex objects (like slices, maps, etc).
This copying can lead to increased memory usage and slower performance.

Pointer receivers are useful when you want to provide default behavior or handle cases where the struct is `nil`.
This avoids runtime panics and allows methods to gracefully handle uninitialized structs.

- Use **value receivers** for small structs or when no modification is needed.
- Use **pointer receivers** when you need to modify the original struct, avoid copying, or handle `nil` receivers.

## Formatting code

There is a default command `go fmt` that will format your code according to some of the Go style guide.
But it doesn't handle imports.

So in the end you may need to use `goimports` which is an extension of `gofmt` that also manages imports.

```shell
go install golang.org/x/tools/cmd/goimports@latest
goimports -w ./...
```

This will format all the go files in the current directory and subdirectories.

## With test

### Coverage

To generate the coverage report for the whole project,
considering integration tests that are written outside the package the tested code lives in.
This is useful for [sonarcloud][4] or other code quality tools type of integration.

```shell
# Run the test and get the coverage
go test go test -coverprofile=./coverage.out ./...
# Alternatively, get the coverage with count mode and for all packages
go test -covermode=count -coverpkg=./... -coverprofile=./coverage.out ./...

# Generate the coverage report from the coverage.out file
go tool cover -html=coverage.out -o coverage.html
```

How does it work?

- The `-covermode=count` counts the number of times each statement is executed.
    - This provides a more detailed view of code coverage, especially for branches and loops.
- The `-coverpkg=./...` considers the overall coverage of all the packages in the module.
    - Instead of showing the coverage of only the package being tested, it aggregates coverage data across all packages.
    - This is useful for cross -package testing scenarios.
- The `-coverprofile=./coverage.out` specifies the output file for the coverage data.
    - This file contains detailed information about which parts of the code were executed during the tests.

### Running multiple test cases in one test

Using `t.Run` to run multiple test with the same setup

```go
func TestSomething(t *testing.T) {
	t.Run("case 1", func(t *testing.T) {
        // test case 1
    })
	t.Run("case 2", func(t *testing.T) {
        // test case 2
    })
}
```

This output will show each case separately in the test results.

```shell
=== RUN   TestSomething
=== RUN   TestSomething/case1
=== RUN   TestSomething/case2
--- PASS: TestSomething (0.00s)
    --- PASS: TestSomething/case1 (0.00s)
    --- PASS: TestSomething/case2 (0.00s)
PASS
ok  	example.com/project	0.002s
```

This is similar to subtests like `describe` and `it` in javascript testing frameworks.
You can also nest `t.Run` calls to create a hierarchy of test cases.

### Set env var in test

Use `t.Setenv` to set an environment variable in a test.
It will be reset after the test is done.

```go
func TestSomething(t *testing.T) {
    t.Setenv("MY_ENV_VAR", "value")
    // test code that uses MY_ENV_VAR
}
```

Use the test context with `t.Ctx()` to pass it down to functions that require a context instead of using `context.Background()`.
This ensures that the context is properly managed and can be canceled if the test fails or times out.

### Writing tests

We have looked at testing in go in a previous post [Start with Go][20].
I like to use assertion libraries to make the tests more readable,
use fewer lines and make the experience more language agnostic.

The standard [documentation][5] recommends to make the tests fail early and prefers standard (often verbose) go over
assertion libraries.

But in practice, a library like [testify][6] has a `require` package that will fail the test immediately on error,
and do it in a more concise way that `t.Error` would.
I don't see any valid reason that would make using assertion library a bad approach,
so far it aligns with my own general development standards. 
Although adding a dependency is always frowned upon, since it runs only for test, it doesn't end up in the built binary.  

## Go package structure

When structuring a Go project, there are various approaches to organizing packages.
Among the most horrible we could have just one file with everything in it, or all files at the root levels, or just a cascade of folders.
This is often a touchy debate because there's multiple ways to make it work and,
some reserved name for packages in Go may confuse other language users.

### Official Recommendation

The official Go documentation provides a simple and straightforward layout for modules and packages:

- **Documentation**: [Go Modules Layout](https://go.dev/doc/modules/layout)
- **Key Points**:
    - Keep the root package for domain types.
    - Use subpackages for logically grouped functionality.
    - Avoid overcomplicating the structure.

Example:

```
myproject/
├── go.mod
├── main.go
├── utils/
│   └── helper.go
└── services/
    └── service.go
```

This layout is minimalistic and works well for small to medium-sized projects.
As project goes this tend to become un-manageable so alternatives emerged.

#### Alternative recommendation

A popular recommendation is the *unofficial* [standard project layout](https://github.com/golang-standards/project-layout),
which describe how a medium size project should be structured.
It is similar to the official recommendation in a sense where the repo organize sub-packages by responsibility (e.g., `domain`, `infrastructure`, `api`) to maintain clarity and
separation of concerns.
But in the end, I didn't find it concrete enough and just used `internal` to create my app's packages (like `db`, `services`, and so on for a simple app). 
But I did keep at root the `cmd` for my `main.go`, the `docs` for project documentation and `tools` for the go tools pattern. 

All in all, it ties to what type of project you have in hand.  
While as a first project you may think the layout matters a lot, it doesn't.
In the end the dependency cycle error is going to let you know if you have messed up. 
So I'd recommend 

#### Guidelines

To help out here are some guidelines which will help you make better decision and ultimately make a defendable Go layout
for your project.
So you'll be prepared if someone questions it! 

1. Avoid `pkg` [Unless Necessary](https://eli.thegreenplace.net/2019/simple-go-project-layout-with-modules/):
    - Use meaningful names for directories instead of a generic `pkg` folder unless the code is public or shared across
      multiple projects.
2. Use `internal` for Encapsulation ([Internal Packages](https://go.dev/doc/go1.4#internalpackages)):
    - Group main subpackages under `internal` to avoid cluttering the root.
    - The `internal` directory is a special convention in Go.
      Packages inside `internal` are only accessible to the parent module, which helps enforce encapsulation.
3. Balance File Size and Complexity ([Organizing Go Code](https://go.dev/blog/organizing-go-code)):
    - Avoid having too many files in a single directory, but also avoid overly large files.
      Split code logically (e.g., models, services, handlers).
4. Keep the Root Clean ([Go Modules Layout](https://go.dev/doc/modules/layout)):
    - Limit the number of files and directories at the root level to improve readability and navigation.
5. Use encapsulation, clear separation, and Maintain a unidirectional dependency flow. ([Community guideline](https://rakyll.org/style-packages/))
   - Organize subpackages by responsibility (e.g., `domain`, `infrastructure`, `api`) to maintain clarity and
     separation of concerns.


[1]: https://github.com/moovweb/gvm
[2]: https://github.com/go-nv/goenv
[3]: https://go.dev/doc/toolchain
[4]: https://sonarcloud.io/
[5]: https://go.dev/wiki/TestComments#assert-libraries
[6]: https://github.com/stretchr/testify

[20]: {% post_url 2024/2024-11-23-Start-with-go %}

