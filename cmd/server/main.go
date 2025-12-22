package main

import (
	"flag"
	"fmt"
	"log"

	"github.com/campus-share/backend/internal/config"
	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/handlers"
	"github.com/campus-share/backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	// Parse command line flags
	migrateFlag := flag.Bool("migrate", false, "Run database migrations")
	flag.Parse()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations if flag is set
	if *migrateFlag {
		if err := database.Migrate(); err != nil {
			log.Fatalf("Failed to run migrations: %v", err)
		}
		log.Println("Migrations completed successfully")
		return
	}

	// Set Gin mode
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	router := gin.Default()

	// Apply middleware
	router.Use(middleware.ErrorHandler())
	router.Use(middleware.CORSMiddleware(&cfg.CORS))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(cfg)
	resourceHandler, err := handlers.NewResourceHandler(cfg)
	if err != nil {
		log.Fatalf("Failed to create resource handler: %v", err)
	}
	commentHandler := handlers.NewCommentHandler()
	ratingHandler := handlers.NewRatingHandler()
	bookmarkHandler := handlers.NewBookmarkHandler()

	// API routes
	api := router.Group("/api/v1")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(cfg), authHandler.GetProfile)
			auth.PUT("/profile", middleware.AuthMiddleware(cfg), authHandler.UpdateProfile)
		}

		// Resource routes
		resources := api.Group("/resources")
		{
			resources.GET("", middleware.OptionalAuthMiddleware(cfg), resourceHandler.ListResources)
			resources.POST("", middleware.AuthMiddleware(cfg), resourceHandler.CreateResource)
			resources.GET("/:id", middleware.OptionalAuthMiddleware(cfg), resourceHandler.GetResource)
			resources.PUT("/:id", middleware.AuthMiddleware(cfg), resourceHandler.UpdateResource)
			resources.DELETE("/:id", middleware.AuthMiddleware(cfg), resourceHandler.DeleteResource)
			resources.GET("/:id/download", middleware.AuthMiddleware(cfg), resourceHandler.DownloadResource)

			// Comments
			resources.GET("/:id/comments", commentHandler.ListComments)
			resources.POST("/:id/comments", middleware.AuthMiddleware(cfg), commentHandler.CreateComment)

			// Ratings
			resources.GET("/:id/rating", ratingHandler.GetRating)
			resources.POST("/:id/rating", middleware.AuthMiddleware(cfg), ratingHandler.CreateRating)
		}

		// Comment routes
		comments := api.Group("/comments")
		comments.Use(middleware.AuthMiddleware(cfg))
		{
			comments.PUT("/:id", commentHandler.UpdateComment)
			comments.DELETE("/:id", commentHandler.DeleteComment)
		}

		// Bookmark routes
		bookmarks := api.Group("/bookmarks")
		bookmarks.Use(middleware.AuthMiddleware(cfg))
		{
			bookmarks.GET("", bookmarkHandler.ListBookmarks)
			bookmarks.POST("", bookmarkHandler.CreateBookmark)
			bookmarks.DELETE("/:id", bookmarkHandler.DeleteBookmark)
		}
	}

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
