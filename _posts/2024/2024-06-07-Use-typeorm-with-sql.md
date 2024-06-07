---
layout: post
title: Connect a NestJS application to an SQL ⛁ database 
color: rgb(254, 9, 2)
tags: [js]
---

To connect a NestJS application to an SQL database, 
we are going to use [typeorm][3] which has a built-in integration with NestJS.

The [official documentation][1] for typeorm integration with your NestJS application is pretty lengthy!
Let's hover the main points to get you started.
If you are not familiar with [NestJS][12], check that article for a quick introduction.

## Installation

Add the typeorm dependency to your NestJS project:

```ts
npm i --save @nestjs/typeorm typeorm pg  
```

We are using postgres for our example, but typeorm supports many other databases.
This will let me go a bit further than the [official documentation][1] with examples for a [real setup][2].

## Create the entity

### From the code

With typeorm, you create the _tables_ and _columns_ directly from the code using the entity classes.
Let's create a `User` entity:

```ts
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('nest_users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500, nullable: true })
  name: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
```

In this example, we are doing a couple of things, let's describe it:
- `@Entity('nest_users')`: This will create a table named `nest_users` in the database.
- `@PrimaryGeneratedColumn()`: This will create a primary key that is auto-incremented.
  - Each new user entity created will have a new id when saved in the database.
  - This is the equivalent of `SERIAL` in postgres, to have a `uuid` instead of a number use: `@PrimaryGeneratedColumn('uuid')`.
  - You can also use `@PrimaryColumn()` if you want to define the primary key yourself.
- `@Column({ length: 500, nullable: true })`: This will create a column in the table with a length of 500 characters that can be null.
  - The arguments are optional and can be omitted.
  - The name of the column is `name` from the variable, but you could also change it passing the name as an argument: `@Column({ name: 'first_name' })`.
- `@CreateDateColumn({ type: 'timestamp' })`: This will create a column in the table with the current timestamp when the entity is created.
  - For updates, you can find the equivalent called: `@UpdateDateColumn`.
  - You can set different types of dates, like `date`, `time`, `timestamptz`, etc.

I find it similar to the equivalent Java library [hibernate][10] with the annotations.

## Persist the table

### Configuration

Now that the entity is created, we need to persist it in the database.
For that, you will need to have postgres database running matching and the proper configuration.

I created a file called `datasource.ts` that will contain the configuration for the database connection:

```ts
const dataSourceOpts: DataSourceOptions = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: true,
  entities: [join(process.cwd(), 'src/**/*.entity.ts')],
  migrations: [join(process.cwd(), 'migrations/*.ts')],
  logging: false,
};
const dataSource = new DataSource(dataSourceOpts);

export default
```

In this setup, most of the information is passed through environment variables, to avoid "_hardcoding_" the database
credentials which could be sensitive information.
- The `entities` option is to let typeorm know where to find the entities to persist in the database.
- The `migrations` option refers to the different changes that happened to your database schema over time.

In your `package.json`, define the typeorm command (replace `ts-node` by `node` if you are not using typescript).

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d src/datasource.ts"
  }
}
```

And now you should be all set to create the tables in the database.

### Create the tables

The entity is not saved in the database until you create a migration and run it against the database.

A migration is a file that contains the changes between the defined entities in your code and the current database schema
structure.
To generate a migration, you can run:

```shell
yarn typeorm migration:generate migrations/AddInitialTables
```

This will create a new file with a timestamp in the `migrations` folder.

The entity is still not persisted yet, you will now need to run that migration in order to commit the change to the 
database:

```shell
yarn typeorm migration:run  
```

You should see the tables created in your database.

Once committed, the migration tables should not be updated, if a change occurs, a new migration should be created.
Which means, everytime you modify an entity in the code, a migration should be created and committed.

> 😬 I messed up the database how do I reset it?

If you have made a mistake or the database is in an odd state (maybe due to a test with your local setup), you can drop
the schema and recreate it with:

```shell
yarn typeorm schema:drop
```

⚠️ Don't drop the schema in production, you will lose all your data! 
Then you can rerun the migration to recreate the tables.

## Interact with the database

### Set up the application

Now that the tables are created, you can start using the repository to interact with the database.
In your Application module (usually) you can add the `TypeOrmModule` to the setup the connection for the application.

```ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...datasource.options,
        migrations: [],
        entities: [],
        autoLoadEntities: true,
      }),
    }),
    // ...other imports
  ],
  // ...other configurations
})
export class ApplicationModule {}
```

The connection used for the application is based on the one used to run the typeorm command from the cli.
With this setup, interacting with entities in the other modules will be possible.
The `autoLoadEntities: true` will load the entities specified by the modules interacting with the database.

### Importing the repository

In your module, you can import the repository to use it in your services via the `TypeOrmModule.forFeature` method
which will load the repository to access the selected entities.

We can have a `UserModule` that will import the `UserRepository` to interact with the `User` entity represented by its
postgres table:

```ts
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserResolver, UserService],
})
export class UserModule {}
```

It looks similar to the previous example because it uses the same `TypeOrmModule` class, but the `forFeature` method
is different and is using the `forRoot` or `forRootAsync` method used in the application module,
to be able to connect to the database.

### Using the repository

Now that we have the module setup, we can create our user service.
A service that can be used to retrieve the users or create a new one (possibly in association with a [REST][12] or [GraphQL][11] API).

```ts
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(name: string): Promise<User> {
    return await this.userRepository.save({ name });
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

Let's describe the User service to see how we interact with the database:
- The `@InjectRepository(User)` is used to inject the `UserRepository` into the service.
  - This repository allows us to interact with the _User_'s table in the database
- We use the `save` method to insert a new user in the database.
  - We could use `const user = new User()`, set the name and then `this.userRepository.save(user)`.
  - ⚠️ The `userRepository.create` makes a user entity copy, but it does not insert anything in the database.
- We use the `find` method to retrieve all the users from the database.
  - There are other find methods like `findOne`, `findByIds`, `findAndCount`, etc.

You can find more advanced usage of the repository in the typeorm [official documentation][4].
This should be enough for now to get you started! 🎉

[1]: https://docs.nestjs.com/techniques/database#typeorm-integration
[2]: https://github.com/sylhare/NestJS/tree/6feac50870516d47df248279008107f640c1a076/src/typeorm
[3]: https://typeorm.io/
[4]: https://typeorm.io/select-query-builder
[10]: {% post_url 2023/2023-06-08-Hibernate-and-annotations %}
[11]: {% post_url 2024/2024-03-18-Nestjs-with-graphql %}
[12]: {% post_url 2024/2024-03-08-Nestjs-typescript-backend %}