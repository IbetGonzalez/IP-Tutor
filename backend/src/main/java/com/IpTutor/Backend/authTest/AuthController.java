package com.IpTutor.Backend.authTest;

import com.IpTutor.Backend.model.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;

    @GetMapping("/getAccount/{email}")
    public Account getAccount(@PathVariable String email) {
        return authService.getAccount(email);
    }

    @GetMapping("/username/{token}")
    public String getUsername(@PathVariable String token) {
        return jwtService.extractUsername(token);
    }

}
