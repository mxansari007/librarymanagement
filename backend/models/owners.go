package models

import (
	"time"
)

// OwnerMembership represents an owner's subscription plan.
type OwnerMembership struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	PlanType  string    `gorm:"not null" json:"plan_type"`
	StartDate time.Time `gorm:"not null" json:"start_date"`
	EndDate   time.Time `gorm:"not null" json:"end_date"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	Libraries []Library `gorm:"foreignKey:OwnerID" json:"-"`
}