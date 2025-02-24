package models

import "time"

type Library struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	OwnerID          uint      `gorm:"not null" json:"owner_id"`
	Name             string    `gorm:"not null" json:"name"`
	Address          string    `json:"address"`
	SubscriptionType string    `gorm:"not null" json:"subscription_type"`
	Rate             uint      `gorm:"default:0;not null" json:"rate"`  // Corrected
	CreatedAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}


type LibraryMembership struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	MemberID         uint      `gorm:"not null" json:"member_id"`
	LibraryID        uint      `gorm:"not null" json:"library_id"`
	IsPaidMembership bool      `gorm:"not null" json:"is_paid_membership"`
	StartDate        time.Time `gorm:"not null" json:"start_date"`
	EndDate          time.Time `gorm:"not null" json:"end_date"`
	CreatedAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

type Librarian struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null" json:"user_id"`
	LibraryID  uint      `gorm:"not null" json:"library_id"`
	AssignedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"assigned_at"`
}
