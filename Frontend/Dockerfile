FROM golang:1
RUN mkdir -p /usr/src/app/Frontend
WORKDIR /usr/src/app/Frontend
COPY . .
EXPOSE 3100

CMD ["go", "run", "main.go"]