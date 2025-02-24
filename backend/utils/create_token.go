package utils

import (
	"time"

	"github.com/golang-jwt/jwt"
	"os"
)


func CreateToken(userId uint) (string, error) {
	secret := os.Getenv("SECRET_KEY")
	claims := jwt.MapClaims{}
	claims["authorized"] = true
	claims["user_id"] = userId
	claims["exp"] = time.Now().Add(time.Hour * 1).Unix() //Token expires after 1 hour
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}