FROM golang:1.21-alpine

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN go mod tidy

EXPOSE 8080

CMD ["go", "run", "main.go"] 