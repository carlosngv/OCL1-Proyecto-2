FROM golang:1
RUN mkdir -p /usr/src/app/Frontend
WORKDIR /usr/src/app/Frontend
COPY . .
EXPOSE 3900

CMD ["go", "run", "main.go"]