package com.IpTutor.Backend.service;

import com.IpTutor.Backend.dto.SessionResponseDTO;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CookieService {

   public Cookie setUpTokenCookie(String token, long expiration) {
        Cookie cookie = new Cookie("jwt_token", token);
        cookie.setPath("/");
        //Token expiration is in milliseconds while cookie expatriation is in seconds
        cookie.setMaxAge((int) (expiration/1000));
        return cookie;
    }
    public SessionResponseDTO deleteJwtToken() {
        return new SessionResponseDTO(setUpTokenCookie(null, 0));
    }

}
