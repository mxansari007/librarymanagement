package models

import "time"

// Library represents a library owned through an OwnerMembership.
type Library struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	OwnerID          uint      `gorm:"not null" json:"owner_id"`
	Name             string    `gorm:"not null" json:"name"`
	Address          string    `json:"address"`
	City             string    `gorm:"not null" json:"city"`
	SubscriptionType string    `gorm:"not null" json:"subscription_type"`
	Rate             uint      `gorm:"default:0;not null" json:"rate"`
	CreatedAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	OwnerMembership  OwnerMembership     `gorm:"foreignKey:OwnerID" json:"-"`
	Books            []Book              `gorm:"foreignKey:LibraryID" json:"-"`
	Librarians       []Librarian         `gorm:"foreignKey:LibraryID" json:"-"`
	Members          []LibraryMembership `gorm:"foreignKey:LibraryID" json:"-"`
}

// LibraryMembership represents a user's membership in a library.
type LibraryMembership struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	MemberID         uint      `gorm:"not null" json:"member_id"`
	LibraryID        uint      `gorm:"not null" json:"library_id"`
	IsPaidMembership bool      `gorm:"not null" json:"is_paid_membership"`
	StartDate        time.Time `gorm:"not null" json:"start_date"`
	EndDate          time.Time `gorm:"not null" json:"end_date"`
	CreatedAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	Library    Library           `gorm:"foreignKey:LibraryID" json:"-"`
	User       User              `gorm:"foreignKey:MemberID" json:"-"`
	Requests   []BookRequest     `gorm:"foreignKey:MembershipID" json:"-"`
	Borrowings []BookTransaction `gorm:"foreignKey:MembershipID" json:"-"`
}

// Librarian represents a user assigned as a librarian to a library.
type Librarian struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null" json:"user_id"`
	LibraryID  uint      `gorm:"not null" json:"library_id"`
	AssignedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"assigned_at"`

	// Relationships
	Library Library `gorm:"foreignKey:LibraryID" json:"-"`
	User    User    `gorm:"foreignKey:UserID" json:"-"`
}