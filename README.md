# Installation

You need to have docker and docker-compose installed

# Building image

```
docker-compose build
```

# Running container
```
docker-compose up
```

# Entering container

```
docker-compose exec web bash
```

# Accessing web service

Edit your hosts file and add your docker machine ip to localhost

Go to http://localhost:3000

You should see "Hello world!"

# Destroy container

```
docker-compose down
```
