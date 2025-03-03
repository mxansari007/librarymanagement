package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// User represents a user who can be a member, owner, or librarian.
type User struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	FirstName       string    `gorm:"not null" json:"first_name"`
	LastName        string    `gorm:"not null" json:"last_name"`
	PasswordHash    string    `gorm:"not null" json:"password_hash"`
	Email           string    `gorm:"unique;not null" json:"email"`
	Role            string    `gorm:"not null" json:"role"`
	ContactNumber   *string   `json:"contact_number"`
	AadhaarNumber   *string   `gorm:"unique" json:"aadhaar_number"`
	AadhaarImageURL *string   `json:"aadhaar_image_url"`
	IsVerified      bool      `gorm:"default:false" json:"is_verified"`
	CreatedAt       time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	OwnerMemberships   []OwnerMembership   `gorm:"foreignKey:UserID" json:"-"`
	LibraryMemberships []LibraryMembership `gorm:"foreignKey:MemberID" json:"-"`
	Librarians         []Librarian         `gorm:"foreignKey:UserID" json:"-"`
}

// BeforeCreate ensures Aadhaar details are provided only for members.
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Role == "member" && (u.AadhaarNumber == nil || *u.AadhaarNumber == "") {
		return errors.New("aadhaar number is required for members")
	}
	if u.Role != "member" && (u.AadhaarNumber != nil || u.AadhaarImageURL != nil) {
		return errors.New("aadhaar details are only allowed for members")
	}
	return nil
}

// BeforeUpdate ensures Aadhaar details are updated only for members.
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	if u.Role == "member" && (u.AadhaarNumber == nil || *u.AadhaarNumber == "") {
		return errors.New("aadhaar number is required for members")
	}
	if u.Role != "member" && (u.AadhaarNumber != nil || u.AadhaarImageURL != nil) {
		return errors.New("aadhaar details are only allowed for members")
	}
	return nil
}

// RejectedUser represents users whose membership was rejected.
type RejectedUser struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"unique;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"password_hash"`
	Reason       string    `gorm:"not null" json:"reason"`
	RejectedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"rejected_at"`
}