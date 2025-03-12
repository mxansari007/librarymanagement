package models

import "time"

// Book represents a book in a library.
type Book struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	LibraryID       uint      `gorm:"not null" json:"library_id"`
	Title           string    `gorm:"not null" json:"title"`
	Author          string    `gorm:"not null" json:"author"`
	Publisher       string    `json:"publisher"`
	BookImage       string    `json:"book_image"`
	Version         string    `json:"version"`
	ISBN            string    `gorm:"unique;not null" json:"isbn"`
	TotalCopies     int       `gorm:"not null" json:"total_copies"`
	AvailableCopies int       `gorm:"not null" json:"available_copies"`
	CreatedAt       time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	Library     Library           `gorm:"foreignKey:LibraryID" json:"-"`
	Requests    []BookRequest     `gorm:"foreignKey:BookID" json:"-"`
	Transactions []BookTransaction `gorm:"foreignKey:BookID" json:"-"`
}

// BookRequest represents a request to borrow a book.
type BookRequest struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	MembershipID uint      `gorm:"not null;uniqueIndex:idx_membership_book" json:"membership_id"`
	BookID       uint      `gorm:"not null;uniqueIndex:idx_membership_book" json:"book_id"`
	Status       string    `gorm:"not null" json:"status"`
	RequestedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"requested_at"`
	ApprovedAt   time.Time `json:"approved_at"`
	LibrarianID  *uint      `json:"librarian_id"`

	// Relationships
	Membership LibraryMembership `gorm:"foreignKey:MembershipID" json:"-"`
	Book       Book              `gorm:"foreignKey:BookID" json:"-"`
	Librarian  *Librarian         `gorm:"foreignKey:LibrarianID" json:"-"`
}




// BookTransaction represents the borrowing of a book.
type BookTransaction struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	BookID           uint      `gorm:"not null" json:"book_id"`
	MembershipID     uint      `gorm:"not null" json:"membership_id"`
	LibrarianID      uint      `json:"librarian_id"`
	DueDate          time.Time `gorm:"not null" json:"due_date"`
	BorrowedAt       time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"borrowed_at"`
	ReturnedAt       *time.Time `json:"returned_at"`
	IsReturnApproved bool      `gorm:"default:false" json:"is_return_approved"`

	// Relationships
	Membership LibraryMembership `gorm:"foreignKey:MembershipID" json:"-"`
	Librarian  Librarian         `gorm:"foreignKey:LibrarianID" json:"-"`
	Book 		Book `gorm:"foreignKey:BookID" json:"book"` // Ensure it has json:"book"
}
