package models

import "time"

type Book struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	LibraryID uint      `gorm:"not null" json:"library_id"`
	Title     string    `gorm:"not null" json:"title"`
	Author    string    `gorm:"not null" json:"author"`
	Publisher string    `json:"publisher"`
	Version   string    `json:"version"`
	ISBN      string    `gorm:"unique;not null" json:"isbn"`
	TotalCopies int       `gorm:"not null" json:"total_copies"`
	AvailableCopies int    `gorm:"not null" json:"available_copies"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

type BookRequest struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	MemberID    uint      `gorm:"not null" json:"member_id"`
	BookID      uint      `gorm:"not null" json:"book_id"`
	Status      string    `gorm:"not null" json:"status"`
	RequestedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"requested_at"`
	ApprovedAt  time.Time `json:"approved_at"`
	LibrarianID uint      `json:"librarian_id"`
}

type BookTransaction struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	BookID           uint      `gorm:"not null" json:"book_id"`
	MemberID         uint      `gorm:"not null" json:"member_id"`
	LibrarianID      uint      `json:"librarian_id"`
	BorrowedAt       time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"borrowed_at"`
	ReturnedAt       time.Time `json:"returned_at"`
	IsReturnApproved bool      `gorm:"default:false" json:"is_return_approved"`
}
