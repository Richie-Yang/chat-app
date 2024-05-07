# Build dependencies
FROM node:17-buster-slim as dependencies
WORKDIR /app
COPY package.json .
RUN npm i
COPY . . 

# Build production image
FROM dependencies as builder
RUN npm run build
CMD npm run start