---
layout: post
title: Liquibase to manage your Database
color: rgb(255, 61, 0)
tags: [open source]
---

[Liquibase][1] is an open source database schema change management solution. What it means is that it will allow you
to save as code in a version control tools changes to your database.
It has capabilities to run and test database schema changes, to reduce errors, and you can deploy and roll back your
database to any specific version.

Even though it is an [open source][10] solution, it does have paid "_Pro_" solution with support.

### How it works

This is meant to be a brief [introduction][2] to present the tool, find more tailored information by joining the
liquibase community.

Liquibase uses **changeset** which contains the information regarding the change to the database.
Historically they have been written in `xml` but since, some other more user-friendly formats are available (YAML, JSON).

Here is an example of an [XML change set][3] to create the `department` table with a few columns:

```xml
<changeSet id="1" author="liquibase">
    <createTable tableName="department">
        <column name="id" type="int">
            <constraints primaryKey="true"/>
        </column>
        <column name="dept" type="varchar(${dep.size})">
            <constraints nullable="false"/>
        </column>
        <column name="emp_id" type="int">
            <constraints nullable="false"/>
        </column>
    </createTable>
</changeSet>
```
Each change set should have a unique id and an author for traceability of the change, they are stored, so you can audit
your system.
The change sets are stored within **changelogs**, like a _ledger_ of all the changes made by liquibase on the database.

Liquibase keep tracks of which change set have been applied in a tracking table directly in the database called 
`DATABASECHANGELOG`. It is created automatically by liquibase.

### Changelog

To generate a changelog file in order to add a change set, use the [liquibase cli][4], you can install it via brew or
directly from the website, then run:

```bash
liquibase init project
```

This will initiate the liquibase project, so you can run other commands. You can modify the [settings][5] to connect to a 
test database as well. You can update the `liquibase.properties` file for that afterward.

You can create a xml changelog from this template or use the command line to generate one:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.4.xsd"
        logicalFilePath="db.changelog-577.xml">
</databaseChangeLog>
```

Inside should be all of your change sets.

### Changeset

Here are some changeset that you can apply to your database.
Those are examples

#### Grant rights to a user

This change doesn't have a custom liquibase tag to it (unlike `createTable` from the previous example). So in order
to make it work and grant some rights to your user, you will need to use the `sql` [change type][7] which lets you enter
any SQL syntax:

```xml
<changeSet id="2" author="example" dbms="mysql" failOnError="false">
    <preConditions onFail="CONTINUE" onError="CONTINUE" onSqlOutput="TEST">
        <sqlCheck expectedResult="1">
            SELECT COUNT(1) FROM information_schema.schemata WHERE schema_name = 'user'
        </sqlCheck>
    </preConditions>
    <sql>
        GRANT SELECT, INSERT, UPDATE, DELETE ON department TO user;
    </sql>
</changeSet>
```

Here we are checking that the user `user` exist on the database before granting new access to the `department` table that
we created.
The _dbms_ specify that we are applying this change to a mySQL database.

#### Create index

[Indexes][6] are used to allow MySQL to find rows with specific columns values quickly. With an index, instead of 
looking at all the data from the first row, the relevant information can be determined by only looking at the column
information. The larger the table the more gain you will get by adding an index. 

```xml
<changeSet id="3" author="example" dbms="mysql">
    <preConditions onFail="MARK_RAN" onSqlOutput="TEST">
        <not>
            <indexExists tableName="department" indexName="id_index"></indexExists>
        </not>
    </preConditions>
    <createIndex tableName="department" indexName="id_index">
        <column name="id"/>
    </createIndex>
</changeSet>
```

Here we are adding an index called `id_index` to the `department` for the `id` column. Note the pre-condition, if the
index already exist, we don't re-create it.

Index creation can be costly in terms of time and resources.

#### Adding a column

Another typical example would be to add a column to an existing table, there's a liquibase command for that:

```xml
<changeSet id="4" author="example">
    <addColumn tableName="department">
        <column name="name" type="varchar(32)" defaultValue="none">
            <constraints nullable="true"/>
        </column>
    </addColumn>
</changeSet>
```

Here we are adding a column on the `department` table named `name` which will have `none` as the default value, but
can be nullable. It's supposed to be a text hence the `varchar(32)`.

### With Liquibase commands

All of those changes are concerning an SQL, or MySQL database, which is what Liquibase is known for. 
However, there are some extension for NoSQL databases like [MongoDb][9], but they use a different set of change type.
(Because creating a table in MongoDb is nonsense, you would need _createCollection_ instead).

However, the command should stay the same. To apply changes, once your _ChangeSet_ in the _ChangeLog_,
use this command to update your database:

```bash
liquibase update
```

Assuming everything is properly set up, you should be able to see the changes reflected in your database. For more
help on the commands, check out the [docs][8].

[1]: https://www.liquibase.org/
[2]: https://www.liquibase.org/get-started/how-liquibase-works
[3]: https://docs.liquibase.com/change-types/create-table.html
[4]: https://www.liquibase.org/DOWNLOAD
[5]: https://docs.liquibase.com/commands/inspection/generate-changelog.html
[6]: https://dev.mysql.com/doc/refman/8.0/en/mysql-indexes.html
[7]: https://docs.liquibase.com/change-types/sql.html
[8]: https://docs.liquibase.com/commands/home.html
[9]: https://github.com/liquibase/liquibase-mongodb
[10]: https://github.com/liquibase
