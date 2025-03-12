package routes

import (
	"github.com/gin-gonic/gin"
	db "github.com/mxansari007/librarymanagement/database"
	"github.com/mxansari007/librarymanagement/handlers"
	"github.com/mxansari007/librarymanagement/middlewares"
)

// SetupRoutes defines all the routes for the application
func SetupRoutes(router *gin.Engine) {



	user := router.Group("/user")
	{
		user.POST("/login", handlers.LoginUser)
	}
	
	open := router.Group("/open")
	{
		open.POST("/libraries", handlers.SearchLibraries(db.DB))
		open.GET("/verify/:email", handlers.IsVerified(db.DB))
	}

	owner := router.Group("/owner")
	{
		owner.GET("/fetch-members/:library_id/:status", handlers.FetchMembers(db.DB))
		owner.POST("/signup", handlers.SignupOwner(db.DB)) // ✅ Corrected
		owner.Use(middlewares.AuthMiddleware("owner"))            // ✅ Middleware should be applied before routes
		owner.GET("/get-dashboard/:library_id", handlers.GetLibraryDashboard(db.DB))
		owner.POST("/create-library", handlers.CreateLibrary(db.DB))
		owner.GET("/libraries", handlers.GetLibraries(db.DB))
		owner.DELETE("/libraries/:library_id", handlers.DeleteLibrary(db.DB))
		owner.PATCH("/libraries/:library_id", handlers.UpdateLibrary(db.DB))
		owner.POST("/create-librarian",handlers.CreateLibrarian(db.DB))
		owner.GET("/librarians", handlers.GetOwnerLibrarians(db.DB))
	}
	
	librarian := router.Group("/librarian")
	{
		librarian.GET("/fetch-members/:library_id", handlers.FetchMembers(db.DB))
		librarian.Use(middlewares.AuthMiddleware("librarian"))
		librarian.GET("/get-dashboard/:library_id", handlers.GetLibraryDashboard(db.DB))
        librarian.POST("/add-book", handlers.CreateBook(db.DB))
		librarian.GET("/books", handlers.GetAllBooks(db.DB))
		librarian.GET("/books/:book_id", handlers.GetBookByID(db.DB))
		librarian.GET("/approve-member/:email", handlers.ChangeStatus(db.DB))
		librarian.POST("/reject-member/:email", handlers.DeleteMember(db.DB))
		librarian.GET("/book-requests", handlers.GetLibraryBookRequests(db.DB))
		librarian.POST("/approve-book", handlers.ApproveBookRequest(db.DB))
		librarian.POST("/return-book", handlers.ReturnBook(db.DB))
		librarian.GET("/returned-books", handlers.GetReturnedBooks(db.DB))

	}

	member := router.Group("/member")
	{
		member.POST("/signup", handlers.SignupMember(db.DB))
		member.Use(middlewares.AuthMiddleware("member"))
		member.GET("/get-dashboard/", handlers.GetMemberDashboard(db.DB))
		member.GET("/fetch-book", handlers.FetchBooks(db.DB))
		member.POST("/request-book", handlers.RequestBook(db.DB))
		member.GET("/fetch-requests", handlers.FetchBookRequests(db.DB))
		member.DELETE("/cancel-request/:book_request_id", handlers.CancelBookRequest(db.DB))
		member.GET("/recent-transactions", handlers.FetchRecentTransactions(db.DB))

	}


}
