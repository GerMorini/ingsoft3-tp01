package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/getsentry/sentry-go"
	sentryhttp "github.com/getsentry/sentry-go/http"
	identitycontroller "github.com/gmorini/inge-soft-3/backend/internal/identity/controller"
	identityrepository "github.com/gmorini/inge-soft-3/backend/internal/identity/repository"
	identityservice "github.com/gmorini/inge-soft-3/backend/internal/identity/service"
	"github.com/gmorini/inge-soft-3/backend/internal/platform/config"
	"github.com/gmorini/inge-soft-3/backend/internal/platform/database"
	"github.com/gmorini/inge-soft-3/backend/internal/platform/health"
	routinescontroller "github.com/gmorini/inge-soft-3/backend/internal/routines/controller"
	routinesrepository "github.com/gmorini/inge-soft-3/backend/internal/routines/repository"
	routinesservice "github.com/gmorini/inge-soft-3/backend/internal/routines/service"
	"github.com/gmorini/inge-soft-3/backend/migrations"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	ctx, stop := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT,
		syscall.SIGTERM,
	)
	defer stop()

	if err := run(ctx, logger); err != nil {
		logger.Error("application stopped", "error", err)
		os.Exit(1)
	}
}

func run(ctx context.Context, logger *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	if cfg.SentryDSN != "" {
		if err := sentry.Init(sentry.ClientOptions{
			Dsn:              cfg.SentryDSN,
			Environment:      cfg.SentryEnvironment,
			EnableTracing:    true,
			TracesSampleRate: 1.0,
			SendDefaultPII:   false,
		}); err != nil {
			return fmt.Errorf("initialize Sentry: %w", err)
		}
		defer sentry.Flush(2 * time.Second)
	}

	pool, err := database.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()
	if err := migrations.Apply(ctx, pool); err != nil {
		return err
	}

	identityRepository := identityrepository.New(pool)
	tokenManager, err := identityservice.NewTokenManager(cfg.JWTSecret)
	if err != nil {
		return err
	}
	identityService, err := identityservice.New(identityRepository, tokenManager)
	if err != nil {
		return err
	}
	identityController := identitycontroller.New(identityService, tokenManager, logger)
	routinesRepository := routinesrepository.New(pool)
	routinesService := routinesservice.New(routinesRepository)
	routinesController := routinescontroller.New(routinesService, logger)
	mux := http.NewServeMux()
	health.New(pool).RegisterRoutes(mux)
	identityController.RegisterRoutes(mux)
	routinesController.RegisterRoutes(mux, identityController.Authenticate)
	if cfg.SentryDSN != "" {
		mux.Handle(
			"GET /api/falla",
			identityController.Authenticate(http.HandlerFunc(captureTestFailure)),
		)
	}

	var handler http.Handler = mux
	if cfg.SentryDSN != "" {
		handler = sentryhttp.New(sentryhttp.Options{Repanic: true}).Handle(handler)
	}

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           logRequests(logger, handler),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			logger.Error("HTTP shutdown failed", "error", err)
		}
	}()

	logger.Info("HTTP server starting", "address", cfg.HTTPAddr)
	if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func captureTestFailure(w http.ResponseWriter, r *http.Request) {
	err := errors.New("falla de prueba del TP9")
	if hub := sentry.GetHubFromContext(r.Context()); hub != nil {
		hub.CaptureException(err)
	}
	http.Error(w, "Error interno.", http.StatusInternalServerError)
}

type responseStatusWriter struct {
	http.ResponseWriter
	status int
}

func (w *responseStatusWriter) WriteHeader(status int) {
	if w.status != 0 {
		return
	}
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func (w *responseStatusWriter) Write(payload []byte) (int, error) {
	if w.status == 0 {
		w.WriteHeader(http.StatusOK)
	}
	return w.ResponseWriter.Write(payload)
}

func logRequests(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		wrapped := &responseStatusWriter{ResponseWriter: w}
		wrapped.Header().Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(wrapped, r)
		logger.Info(
			"HTTP request completed",
			"method", r.Method,
			"path", r.URL.Path,
			"status", wrapped.status,
			"duration_ms", time.Since(started).Milliseconds(),
		)
	})
}
