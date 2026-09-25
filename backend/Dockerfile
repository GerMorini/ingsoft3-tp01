FROM golang:1.26.5-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM build AS test

ENV COVERAGE_DIR=/out

ENTRYPOINT ["sh", "/src/scripts/test-coverage.sh"]

FROM scratch

COPY --from=build /out/api /api

USER 65532:65532
EXPOSE 8080

ENTRYPOINT ["/api"]
