FROM node:14
RUN mkdir -p /usr/src/app/PythonServer
WORKDIR /usr/src/app/PythonServer
COPY package*.json ./
RUN npm install 
COPY . .
EXPOSE 3200

CMD ["npm", "run", "dev"]