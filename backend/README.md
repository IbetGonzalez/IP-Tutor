# Compile
Compile from using command : mvn package

## Run in dev mode with:
    mvn spring-boot:run
or
    mvn spring-boot:run -Pdev

To run in production mode:
    mvn spring-boot:run -Pprod

# JSON file formats for accounts:
## localhost:xxxx/accounts/create (Post Mapping)
Creates account and adds it to the database

Returns null if the username or email already exists
```
    {
        "username": "",
        "email": "",
        "password": ""
    }
```

### localhost:xxxx/accounts/getAccount (Get Mapping)
Returns the username, email, and creation date if the email is found

Returns null if the email is not found

```
    {
        "email": ""
    }
```

### localhost:xxxx/accounts/checkEmail (Get Mapping)
Returns true if there is an account with the email and false if not
```
    {
        "email": ""
    }
```

### localhost:xxxx/accounts/checkUsername (Get Mapping)
Returns true if there is an account with the username and false if not
```
    {
        "username": ""
    }
```

### localhost:xxxx/accounts/deleteAccount (Delete Mapping)
Returns the number of accounts deleted
```
    {
        "email": ""
    }
```
