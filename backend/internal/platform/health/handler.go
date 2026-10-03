package health

import (
	"context"
	"encoding/json"
	"net/http"
)

type Pinger interface {
	Ping(context.Context) error
}

type Handler struct {
	database Pinger
}

func New(database Pinger) *Handler {
	return &Handler{database: database}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /health", h.liveness)
	mux.HandleFunc("GET /api/ready", h.readiness)
}

func (h *Handler) liveness(w http.ResponseWriter, _ *http.Request) {
	writeStatus(w, http.StatusOK, "ok")
}

func (h *Handler) readiness(w http.ResponseWriter, r *http.Request) {
	if err := h.database.Ping(r.Context()); err != nil {
		writeStatus(w, http.StatusServiceUnavailable, "unavailable")
		return
	}

	writeStatus(w, http.StatusOK, "ready")
}

func writeStatus(w http.ResponseWriter, code int, status string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": status})
}
