FROM node:7

RUN npm install supervisor -g

RUN mkdir /src

WORKDIR /src
ADD app/app.js /src/app/app.js
ADD app/package.json /src/package.json
RUN npm install

EXPOSE 8080

CMD supervisor -w app app/app.js
