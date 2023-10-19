This repo contains the code for a simple callerID backend which supports some of the functionaliity of popular callerId apps like truecaller.
Supported features are->
1. User registration and login
2. Ability to mark a phone number as spam
3. Search for a user by phone number, name etc
4. Spam likelihood for phone number result. Eg if you search for a phone number you get a percentage probability of the number being a spammer.
5. Data population scripts for load testing the application
6. Redis caching for optimisation

The screenshots of the functioning application are attached in the screenshots folder, along with a file containing postman API collection for swift setup.

I have used sequelize as an ORM for postgres. Redis is used for caching some of the expensive operations. 

Pre-requisites: -> 
1. postgres installed on the host system
2. Redis 
3. Node.js

Reference on setting up and installing postgres -> `https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-20-04`
In case it is needed , I have also attached the backup of the database for easy restoration and setup through pgAdmin. The backup can be found at the folder named 'backupDB'.

Once you are done with prerequisites, follow along ->
Steps for local setup:
1. At the root of the project directory run ```npm install```
2. Configure your environment variables and passwords in the .env file located at root of repo.
3. To populate the DB run ```npm run populate```. This will insert some data inside the tables.
4. To start the app run ```npm run dev```. 
5. To test the APIs take the postman collection attached in the folder and import it in your    app for fast setup.
6. First login to the app. And take the token it gives and add it in the headers of all the request you make from now on as all the routes are protected.
7. The token expires at interval of 2 Hours.
