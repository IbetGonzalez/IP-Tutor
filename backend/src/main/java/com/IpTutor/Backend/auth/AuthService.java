package com.IpTutor.Backend.authTest;

import com.IpTutor.Backend.model.Account;
import com.IpTutor.Backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public Account getAccount(String email) {
        var found = accountRepository.findByEmail(email);
        return (Account) found.orElse(null);
    }

}
