#use the official docker node image as base
FROM node:26

#set the working directory inside the container
WORKDIR /usr/src/app

#copy package.json and package-lock.json first to levarage docker cache
COPY package*.json ./

#install app dependencies
RUN npm install

#copy rest of the apps source cdoe to contaner
COPY . . 

#expose the port on which the app will run
EXPOSE 5501

#the command to run the app
CMD ["npm", "run", "dev"]