package utils

import (

	"github.com/golang-jwt/jwt"
	"os"
)

func VerifyToken(tokenString string) (uint, error) {
	secret := os.Getenv("SECRET_KEY")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	})
	if err != nil {
		return 0, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return 0, jwt.ErrSignatureInvalid
	}
	userId, ok := claims["user_id"].(float64)
	if !ok {
		return 0, jwt.ErrSignatureInvalid
	}
	return uint(userId), nil
}