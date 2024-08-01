# Compile
Compile from using command : mvn package

## Run in dev mode with:
    mvn spring-boot:run
or
    mvn spring-boot:run -Pdev

To run in production mode:
    mvn spring-boot:run -Pprod

# JSON file formats for accounts:
### localhost:xxxx/accounts/create (Post Mapping)
```
    {
        "username": "",
        "email": "",
        "password": ""
    }
```

#### Returns Http Status:
* Unsuccessful: 400 (bad request)
* Successful: 201 (created)
  * Json with account username, email, and creation date

### localhost:xxxx/accounts/login (Get Mapping)
```
    {
        "email": "",
        "password": ""
    }
```
#### Returns Https Status:
* Account not found: 404 (not found)
* Incorrect password: 401 (unauthorized)
* Successful: 200 (ok)
  * New token and its expiration time

### localhost:xxxx/accounts/checkEmail (Get Mapping)
```
    {
        "email": ""
    }
```

#### Returns Http Status:
* Email exists: 409 (conflict)
* Invalid email format: 400 (bad request)
* Email doesn't exist (Successful): 200 (ok)

### localhost:xxxx/accounts/update/username (Put Mapping)

```
    {
        "password": "",
        "username": ""
    }
```

#### Returns Http Status:
* Account not found: 404 (not found)
* Invalid username format: 400 (bad request)
* Successful: 200 (ok)

### localhost:xxxx/accounts/deleteAccount (Delete Mapping)
```
    {
        "email": ""
    }
```

#### Returns Http Status:
* Account not found: 404 (not found)
* Success: 200 (ok)
