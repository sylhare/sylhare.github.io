---
layout: post
title: Using hibernate and its annotations
color: rgb(242,176,119)
tags: [java]
---

[Hibernate][1] is an open-source java framework for [ORM][2] (Object relational mapping). 
It helps simplify the translation between object-oriented programming languages and relational database tables.
There are two common [patterns][4] to do that:
- **Active record pattern** which holds both the persisted data and implements an interface to save, update, delete the data.
- **Data mapper pattern** which adds a layer between the data and the logic, each table is represented by a data model and there's an entity manager
that will take care of the operation on the database.
  
With an [ORM][5], you could switch database technology at [any time][3] without changing your code. So in this article we are going
to go over Hibernate (which is using the data mapper pattern) and the most common annotations.

### @Entity

To create an entity via hibernate, first you will need to set up the `EntityManager` with the `META-INF/persistence.xml` 
file in the class pass for its configuration.
Then the entity manager will map Java classes to database tables using the `@Entity` annotation and the `@Table` annotation.

```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    private Integer id;
}
```

- The `@Entity` annotation is used to specify that a Java class is an entity class and should be mapped to a database table.
- The `@Table` annotation is used to specify the name of the table that is associated with the entity.
- The `@Id` annotation is used to specify the primary key of an entity.

### @Columns

The `@Column` annotation is used to map a specific field to a column in the database table.

```java
@Entity
@Table(name = "Books")
public class Book {
    @Column(name = "book_title", length = 255, nullable = true, unique = false)
    private String title;
}
```

Some attributes of the `@Column` annotation are:

- `name`: We can change the name of the entity for the database.
- `unique`: The column is marked for containing only unique values.
- `nullable`: Whether the value can be null.
- `length`: For the maximum amount of character the value can have, (could be `columnDefinition = "varchar(255)"` as well)

### @Transient

The [transient][6] keyword in java is already use in the serialization context, where fields declared as `transient` are 
ignored.
The `@Transient` annotation in [hibernate][7] works in the same way, to have fields within an entity that you don't want to
persist. When using `@Transient` with getters, it means that the getter method does not correspond
to a persistent property.

Here is an example:

```java
@Entity
@Table(name = "Users")
public class User {
    @Transient
    private Date loginTime;

    private String name;
    
    @Column(name = "name", length = 128)
    public String getRealName() {
        return name;
    }
    
    @Transient
    public String getName() { return "hello " + name; }
    
    public void setName(String name) { this.name = name; }
}
```

The `loginTime` is annotated and won't be saved in the database, the `getName()` is annotated and is ignored, the 
`getRealName` will be used to for the persisted `name` value.

### @Type

The `@Type` annotation in Hibernate is used to specify a custom type to persist data into the database.
It will map the Java object types to a SQL types.

The `@Type` annotation should be placed on the field or getter method of an entity class, the attribute `name` is used
to declare which mapper to use for the type. You don't need to use it for built-in values (like string, boolean, integer, ...).
To create your own, you need to implement the org.hibernate.usertype.UserType interface.

Here is an example of using the @Type annotation to map a Java object property to a custom Hibernate type:

```java
public class MyCustomType implements UserType {
    public static final String NAME = "MyCustomType";

    // The SQL type
    @Override
    public int[] sqlTypes() { return new int[] { Types.VARCHAR }; }
    
    // The java class
    @Override
    public Class<?> returnedClass() { return String.class; }

    // Custom logic to get the value
    @Override
    public Object nullSafeGet(ResultSet rs, String[] names, SessionImplementor session, Object owner) throws HibernateException, SQLException {
        return rs.getString(names[0]);
    }
    
    // ...Other methods to implement
}
```

There's no real customization happening, since it's a regular conversion from a varchar to a string. You wouldn't need
a custom type for this case, however let's imagine you are actually applying some custom logic on the value.

Then use it within your entity class such as:

```java
@Entity
@Table(name = "Books")
public class Book {
    @Type(type = MyCustomType.NAME)
    private String title;
    @Type(type="yes_no")
    private boolean isPublished;
}
```

The `@Type` annotation can be used in conjunction with the `@Columns` annotation to map 
a single Java object property to multiple columns in the database.
In this example you can see both the custom type we created and an example of a provided type from the Hybernate framework.

The `"yes_no"` (or via `StandardBasicTypes.YES_NO`) type maps a boolean data type to a CHAR (1) column in the database, this type can be used to store "Y" or "N" values instead
of 0/1, true/false.

### Other annotations

You can also have other annotation like `@OneToOne` which create a one-to-one relationship between two entities via the
`@JoinColumn` annotation which is used to specify the foreign key column in the database.
The `@BatchSize` annotation is to set the [batch size][8], when loading multiple entities at once.

```java
@Entity
@Table(name = "Libraries")
public class Library {
    
    private Publisher publisher;
    
    @OneToOne(fetch = FetchType.LAZY, orphanRemoval = true, cascade = {CascadeType.ALL})
    @JoinColumn(name = "publisher_id")
    public Publisher getPublisher() {
        return publisher;
    }
    
    @BatchSize(size = 100)
    Set<Product> getBooks() { return books; };
}
```

You have more annotations like `@OneToMany` and `@ManyToOne` or the `@ManyToMany` to add [associations][9] between your 
entities.

You write less SQL in your code and with those annotations, it feels like magic. However, this give you little 
context of what is going on in your application, and you might be making your app considerably slower with too many 
join annotation without noticing it.

[1]: https://hibernate.org/community/license/
[2]: https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping
[3]: https://www.theserverside.com/definition/object-relational-mapping-ORM
[4]: https://www.thoughtfulcode.com/orm-active-record-vs-data-mapper/
[5]: https://culttt.com/2014/06/18/whats-difference-active-record-data-mapper/
[6]: https://www.baeldung.com/java-transient-keyword
[7]: https://stackoverflow.com/questions/21477034/what-does-transient-annotation-mean-for-methods
[8]: https://www.baeldung.com/hibernate-fetchmode
[9]: https://www.baeldung.com/hibernate-one-to-many
