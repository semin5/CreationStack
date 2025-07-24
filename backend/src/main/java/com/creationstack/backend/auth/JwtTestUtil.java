package com.creationstack.backend.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;

public class JwtTestUtil {

    private static final String SECRET_KEY = "XhnFbzwGs2VOi-2nHeTpf8uYPfSLy3Ua9lBIdGJcyYTArUj-BA1BrP4BZ03YptrPKIRphL7iHoDV1e_A6dOpcg=="; // 하드코딩 테스트용

    public static String generateToken(Long userId) {
        long now = System.currentTimeMillis();
        long expiration = 1000 * 60 * 60 * 24; // 1일

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expiration))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY.getBytes())
                .compact();
    }

    public static void main(String[] args) {
        String token = generateToken(1001L); // 예: subscriberId
        System.out.println("Bearer " + token);
    }
}
