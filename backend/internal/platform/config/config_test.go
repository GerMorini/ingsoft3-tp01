package config

import (
	"strings"
	"testing"
)

func TestLoad(t *testing.T) {
	tests := []struct {
		name        string
		databaseURL string
		jwtSecret   string
		httpAddr    string
		wantAddr    string
		wantErr     string
	}{
		{
			name:        "valid defaults",
			databaseURL: "postgres://localhost/app",
			jwtSecret:   strings.Repeat("s", 32),
			wantAddr:    "127.0.0.1:8080",
		},
		{
			name:      "missing database URL",
			jwtSecret: strings.Repeat("s", 32),
			wantErr:   "DATABASE_URL is required",
		},
		{
			name:        "short JWT secret",
			databaseURL: "postgres://localhost/app",
			jwtSecret:   strings.Repeat("s", 31),
			wantErr:     "JWT_SECRET must contain at least 32 bytes",
		},
		{
			name:        "custom address",
			databaseURL: "postgres://localhost/app",
			jwtSecret:   strings.Repeat("s", 32),
			httpAddr:    "127.0.0.1:9090",
			wantAddr:    "127.0.0.1:9090",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Setenv("DATABASE_URL", test.databaseURL)
			t.Setenv("JWT_SECRET", test.jwtSecret)
			t.Setenv("HTTP_ADDR", test.httpAddr)
			t.Setenv("TEST_DATABASE_URL", "postgres://localhost/app_test")
			t.Setenv("SENTRY_DSN", "https://public@example.ingest.sentry.io/1")
			t.Setenv("SENTRY_ENVIRONMENT", "production")

			got, err := Load()
			if test.wantErr != "" {
				if err == nil || err.Error() != test.wantErr {
					t.Fatalf("Load() error = %v, want %q", err, test.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("Load() unexpected error: %v", err)
			}
			if got.HTTPAddr != test.wantAddr {
				t.Errorf("HTTPAddr = %q, want %q", got.HTTPAddr, test.wantAddr)
			}
			if got.TestDatabaseURL != "postgres://localhost/app_test" {
				t.Errorf("TestDatabaseURL = %q", got.TestDatabaseURL)
			}
			if got.SentryDSN != "https://public@example.ingest.sentry.io/1" {
				t.Errorf("SentryDSN = %q", got.SentryDSN)
			}
			if got.SentryEnvironment != "production" {
				t.Errorf("SentryEnvironment = %q", got.SentryEnvironment)
			}
		})
	}
}
