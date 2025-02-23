package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	FirstName       string    `gorm:"not null" json:"first_name"`
	LastName        string    `gorm:"not null" json:"last_name"`
	PasswordHash    string    `gorm:"not null" json:"-"`
	Email           string    `gorm:"unique;not null" json:"email"`
	Role            string    `gorm:"not null" json:"role"`
	AadhaarNumber   *string   `gorm:"unique" json:"aadhaar_number"`
	AadhaarImageURL *string   `json:"aadhaar_image_url"`
	IsVerified      bool      `gorm:"default:false" json:"is_verified"`
	CreatedAt       time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// BeforeCreate ensures Aadhaar details are provided only for members
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Role == "member" && (u.AadhaarNumber == nil || *u.AadhaarNumber == "") {
		return errors.New("aadhaar number is required for members")
	}
	if u.Role != "member" && (u.AadhaarNumber != nil || u.AadhaarImageURL != nil) {
		return errors.New("aadhaar details are only allowed for members")
	}
	return nil
}

// BeforeUpdate ensures Aadhaar details are updated only for members
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	if u.Role == "member" && (u.AadhaarNumber == nil || *u.AadhaarNumber == "") {
		return errors.New("aadhaar number is required for members")
	}
	if u.Role != "member" && (u.AadhaarNumber != nil || u.AadhaarImageURL != nil) {
		return errors.New("aadhaar details are only allowed for members")
	}
	return nil
}
