package utils

import (
	"fmt"
	"math/rand"
	"time"
)

// GenerateISBN creates a random 13-digit ISBN
func GenerateISBN() string {
	rand.Seed(time.Now().UnixNano())

	// Generate first 12 digits randomly
	isbnPrefix := "978" // Standard ISBN-13 prefix
	randomPart := rand.Intn(1000000000) // 9 random digits
	isbnWithoutChecksum := fmt.Sprintf("%s%09d", isbnPrefix, randomPart)

	// Compute the 13th check digit
	checksum := calculateISBN13Checksum(isbnWithoutChecksum)

	// Append checksum to form full ISBN
	return fmt.Sprintf("%s%d", isbnWithoutChecksum, checksum)
}

// calculateISBN13Checksum computes the checksum for an ISBN-13 number
func calculateISBN13Checksum(isbn string) int {
	var sum int
	for i, digit := range isbn {
		num := int(digit - '0') // Convert rune to integer
		if i%2 == 0 {
			sum += num
		} else {
			sum += num * 3
		}
	}
	checkDigit := (10 - (sum % 10)) % 10 // Compute final checksum
	return checkDigit
}
