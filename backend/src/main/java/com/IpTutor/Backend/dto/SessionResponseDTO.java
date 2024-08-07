package com.IpTutor.Backend.dto;

import jakarta.servlet.http.Cookie;

public record SessionResponseDTO(Cookie jwt_token) {
}
