# starThing

## What is starThing for?

Our employer is trying to make a proof of concept on how a Blockchain application can be implemented in his company.

He is an astronomy fan and because of that he spends most of his free time searching stars in the sky, that's why he wants to create a test application that allows him and his friends to register stars, and track the ownership of each.

## How to get the repo up and going

Download this repo: ```gh repo clone pjdmatts/starThing```

CD into repo: ```cd starThing```

Run npm install: ```npm install```

Notes on build: 

- We started with the Linux boiler plate

- An existing package-lock.json may make npm unhappy, if so delete that file

## Using starThing

Start the app: ```node app.js```

You should see 

```
Going to make a Genesis Block
Server Listening for port: 8000
```

We used [POSTMAN](https://www.postman.com/) to test the API

First thing to test is that the block at height 0 is the Genesis Block. 

GET ```localhost:8000/block/height/:height```

![](images/block_by_height.png?raw=true)

Next we ask the API to create a message that will be tied to our wallet address by sending a POST to ```localhost:8000/requestValidation``` and pasting into the body our wallet address. Note: to get the wallet address we used the [online signature tool](https://reinproject.org/bitcoin-signature-tool/#sign) introduced in the project.

POST:```localhost:8000/requestValidation```

![](images/request_validation.png?raw=true)

After that we sign the message, and use the signature for adding stars. This is another POST to ```localhost:8000/submitStar``` with data pasted into the body. Here is an example of some data to post:

```
{
"address":"1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
"signature":"Gzi9FDAO56wtZUoGFwUzXxPZEkN/SNsKDU7vvzIjmhGj5sSTol6QkJUTzoRkNMvrUU4F9JNB9OfRBYrAqgN/VTU=",
"message":"1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN:1660684621:starRegistry",
"star": {
         "dec": "71° 52' 56.9",
         "ra": "19h 29m 1.0s",
         "story": "black hole sun"
     }
}
```

The JSON includes:

- The address of the wallet (the 'owner' of the star)

- The signature

- The message we signed

- A Star object

POST: ```localhost:8000/submitStar```

![](images/submit_star1.png?raw=true)

Once we have several stars added to the chain we can find the ones owned by the wallet address we have been using:

GET: ```localhost:8000/blocks/:address```

![](images/stars_owned.png?raw=true)

We can check back and see blocks at different heights:

GET ```localhost:8000/block/height/:height```

![](images/block_by_height4.png?raw=true)

And we can find blocks by their hash:

GET ```localhost:8000/block/hash/:hash```

![](images/block_by_hash.png?raw=true)

Finally we can use a new endpoint to validate the entire chain:

GET ```localhist:8000/validate```

![](images/validate_chain.png?raw=true)




