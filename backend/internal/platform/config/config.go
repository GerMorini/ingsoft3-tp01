package config

import (
	"errors"
	"os"
)

const defaultHTTPAddr = "127.0.0.1:8080"

type Config struct {
	DatabaseURL       string
	TestDatabaseURL   string
	HTTPAddr          string
	JWTSecret         string
	SentryDSN         string
	SentryEnvironment string
}

func Load() (Config, error) {
	cfg := Config{
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		TestDatabaseURL:   os.Getenv("TEST_DATABASE_URL"),
		HTTPAddr:          os.Getenv("HTTP_ADDR"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		SentryDSN:         os.Getenv("SENTRY_DSN"),
		SentryEnvironment: os.Getenv("SENTRY_ENVIRONMENT"),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL is required")
	}
	if len([]byte(cfg.JWTSecret)) < 32 {
		return Config{}, errors.New("JWT_SECRET must contain at least 32 bytes")
	}
	if cfg.HTTPAddr == "" {
		cfg.HTTPAddr = defaultHTTPAddr
	}

	return cfg, nil
}
