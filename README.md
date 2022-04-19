# snake-game
Snake game with steroids

This project is a browser-based video game developed with JavaScript. It uses React for the frontend and NodeJs with Express for the backend, it also has a Mongo database to store player data.

The project can be started individually in each of its parts or with the Docker Compose that is already configured, to do this from the path from which it is found, we must run the command "docker-compose up -d --build" and this starts the project on ports 3000 (front), 3003 and 3004 (http and socket api) and 27017 (mongo) in detached mode, so these ports must be free.

To play the game it asks us to register, but it can be fake data. After this we will go to a screen to find a room that can have up to 4 players. The places that are not real players will be occupied by bots. We can join a public room or create our own private room. 

The objective is to kill the rest of the players using the objects with active and passive abilities that appear randomly on the map.

