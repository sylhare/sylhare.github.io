---
layout: post 
title: Openapi swagger codegen with kotlin 
color: rgb(52, 86, 139)
tags: [kotlin]
---

In this article we'll look at a Kotlin springboot project using a generated API from a _"swagger file"_. As usual, find the
code in GitHub at [sylhare/Petshop](https://github.com/sylhare/Petshop) 🐶🛒.

## Code generation

Using
the [petstore.yml](https://raw.githubusercontent.com/openapitools/openapi-generator/master/modules/openapi-generator/src/test/resources/3_0/petstore.yaml)
example. We are going to use [openapi-generator](https://github.com/OpenAPITools/openapi-generator) which is a fork from
the [swagger-codegen](https://swagger.io/tools/swagger-codegen/)
to generate the code for our Kotlin application.

### Specification

Swagger is based on the [OpenApi Specification](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md),
that's why you can see the `openapi: <version>` at the top of the yaml file. When talking about swagger yaml file, it's
basically this type of OpenApi specific yaml file.

### Create the Rest API with only the openapi file

#### Generate the files

You need to install [openapi-generator](https://github.com/OpenAPITools/openapi-generator):

```bash
brew install openapi-generator
```

Then run it using your openapi yaml file and if you have your config file. You can also specify
some [global properties](https://openapi-generator.tech/docs/globals/#available-global-properties) as key=value pairs.
(Find the configuration for [java](https://openapi-generator.tech/docs/generators/java/)
and [kotlin](https://openapi-generator.tech/docs/generators/kotlin/))

```bash
openapi-generator generate -i src/main/resources/petstore.yml -g kotlin-spring  --config src/main/resources/api-config.json
# openapi-generator generate -i ../src/main/resources/petstore.yml -g kotlin-spring  --config ../src/main/resources/api-config.json --global-property apiTests=true,modelTests=true,apiDocs=true,modelDocs=true
```

> Note: The modelTests, apiTests, modelDocs, apiDocs needs to be defined in the yaml to be generated

This will create the project with a **build.gradle.kts** (and also a **pom.xml** for maven). 

#### Make it compile properly

The `api-config.json` has `"serviceInterface": true` to create the _service_ in the api. 
You will still have to add to the corresponding api:

```kotlin
val service: PetApiService
```

For gradle, the wrapper won't be created automatically, you can do so by running:

```bash
gradle wrapper --gradle-version 4.8 --distribution-type all
./gradlew assemble
```

The syntax used in the generated _build.gradle.kts_ is rather old and mostly compatible with 4.8. You will have some
work to do if you intend to put your project up to date.

#### Implement the logic

Then you need to create the `PetApiServiceImpl` that implements `PetApiService` and add it to the `PetApiController`
implementing `PetApi`:

```kotlin
@RestController
class PetApiController : PetApi {

    @Autowired
    override lateinit var service: PetApiServiceImpl
}
```

This service is where you can start adding your own implementation of the [Petshop](https://github.com/sylhare/Petshop).
Because the openapi-generator only creates the apis/endpoints and models from the yaml, it's not that magical! 🧙‍

To build the project using gradle, run:

```bash
./gradlew build && java -jar build/libs/openapi-spring-1.0.0.jar
```

If all builds successfully, the server should run on [http://localhost:8080/](http://localhost:8080/)

### Customize an API respecting an openapi contract

#### Add the gradle task

If you want to customize or use the generated classes for something else. You can use
the [org.openapi.generator plugin](https://openapi-generator.tech/docs/plugins/) in your code like:

```kotlin
plugins {
    id("org.openapi.generator") version "5.1.1"
}
```

Then you will be able to use the `openApiGenerate` task to generate the code from the yaml files.

```kotlin
openApiGenerate {
    generatorName.set("spring")
    inputSpec.set("src/main/resources/petstore.yml")
    outputDir.set("$buildDir/generated")
    configFile.set("src/main/resources/api-config.json")
}
```

If we analyze the task, we find:

- The generator is `spring` to be compatible with our spring-boot application
- The `inputSpec` is the openapi file that the code will be generated from.
- The `outputDir` is where the generated code will be placed. (it's better to leave it in the build directory)
- The `api-config.json` store all the [configuration](https://openapi-generator.tech/docs/generators/jaxrs-spec/) for
  the code generation.

In some case where there are multiple yaml files depending on each other for definitions, you can
use `templateDir.set()`
to set the directory where those dependant yaml files will be.

> We could use other generator like the [`jaxrs-spec`](https://en.wikipedia.org/wiki/Jakarta_RESTful_Web_Services) depending on the framework used.
(e.g. the JAX-RS provides annotations and interfaces that can be implemented to create a Restful API)

Then you need to add the generated code to your source set:

```kotlin
// Add the generated sources to your project
java.sourceSets["main"].java.srcDir("$buildDir/generated/src/main/java")
```

This way you can call it from your _src/main/kotlin_ code and start implementing it.

#### Openapi yaml file

Create a basic yaml file following the [swagger documentation](https://swagger.io/docs/specification/basic-structure/),
or just modify an existing one to get this _"petshop"_ api:

```yaml
openapi: 3.0.0
info:
  description: Petshop to test yml file generation
  version: 1.0.0
  title: Petshop example

paths:
  /petshop: # That will be the name of the api -> PetshopApi
    post: # Type of request: POST
      tags:
        - shop
      summary: Do nothing really
      description: ''
      operationId: petshopMethod # That will be the method to add the logic
      responses: # ApiResponse documentation 
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
        '405':
          description: Invalid input
      requestBody: # RequestBody for the Post request
        $ref: '#/components/requestBodies/Pet'
```

The `'#/components/requestBodies/Pet'` are defined in
the [petstore.yml](https://raw.githubusercontent.com/openapitools/openapi-generator/master/modules/openapi-generator/src/test/resources/3_0/petstore.yaml)
, you can either copy that yaml file inside the _petstore.yaml_ or use file referencing
like `./petstore.yml#/components/requestBodies/Pet'`.
(This is a case where you would use the template setting in the gradle task).

#### Implementation

Then we implement a basic logic that basically return what has been sent:

```kotlin
@RestController
class ShopImpl : ShopApi {
    override fun petshopMethod(pet: Pet?): ResponseEntity<Pet> {
        return ResponseEntity(pet!!, HttpStatus.OK)
    }
}
```

You can see that the endpoint is inheriting `ShopApi` which is defined in the yaml file above.
If not implemented the `petshopMethod` would return a 415 "NOT_IMPLEMENTED". 

All the endpoint logic is saved in the PetShopApi interface, we only need to do the implementation. 

#### Unit test

We can finally test that everything works:

```kotlin
@Test
fun postExamplePetMvc() {
    mockMvc.perform(post("/shop").content(petPayload).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk)
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().string(petPayload))
}
```

Using `@AutoConfigureMockMvc` with our `@SpringBootTest` we can autowire the `MockMvc` to make the call to our spring
api. Then check that the status, contentType and response is what is expected.

The `petPayload` is a string of the json representation of the `Pet` object. 
