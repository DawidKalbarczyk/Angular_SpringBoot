package com.application.demo;

public record UserCreateRequest(
        String userId,
        String userEmail,
        String userName,
        String photoURL
) {
}