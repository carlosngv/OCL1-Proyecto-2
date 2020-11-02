FROM node:14
RUN mkdir -p /usr/src/app/JSServer
WORKDIR /usr/src/app/JSServer
COPY package*.json ./
RUN npm install 
COPY . .
EXPOSE 3200

CMD ["npm", "run", "dev"]