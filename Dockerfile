FROM node:7

RUN npm install supervisor -g

RUN mkdir /src

WORKDIR /src
ADD app/package.json /src/package.json
RUN npm install

EXPOSE 3000

CMD supervisor -w app app/app.js
