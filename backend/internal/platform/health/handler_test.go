package health

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

type pingerStub struct {
	err error
}

func (p pingerStub) Ping(context.Context) error {
	return p.err
}

func TestHandler_Liveness(t *testing.T) {
	t.Parallel()

	handler := New(pingerStub{})
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	response := httptest.NewRecorder()

	mux.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}
	if got := response.Header().Get("Content-Type"); got != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", got)
	}
	if got := response.Body.String(); got != "{\"status\":\"ok\"}\n" {
		t.Errorf("body = %q, want liveness response", got)
	}
}

func TestHandler_Readiness(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		pingError  error
		wantStatus int
		wantBody   string
	}{
		{
			name:       "database available",
			wantStatus: http.StatusOK,
			wantBody:   "{\"status\":\"ready\"}\n",
		},
		{
			name:       "database unavailable",
			pingError:  errors.New("connection failed"),
			wantStatus: http.StatusServiceUnavailable,
			wantBody:   "{\"status\":\"unavailable\"}\n",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			handler := New(pingerStub{err: test.pingError})
			mux := http.NewServeMux()
			handler.RegisterRoutes(mux)
			request := httptest.NewRequest(http.MethodGet, "/api/ready", nil)
			response := httptest.NewRecorder()

			mux.ServeHTTP(response, request)

			if response.Code != test.wantStatus {
				t.Fatalf("status = %d, want %d", response.Code, test.wantStatus)
			}
			if got := response.Body.String(); got != test.wantBody {
				t.Errorf("body = %q, want %q", got, test.wantBody)
			}
		})
	}
}
