package com.IpTutor.Backend.controller;

import com.IpTutor.Backend.dto.*;
import com.IpTutor.Backend.service.AccountService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;


    private Cookie setUpTokenCookie(String token, long expiration) {
        Cookie cookie = new Cookie("jwt_token", token);
        cookie.setPath("/");
        //Token expiration is in milliseconds while cookie expatriation is in seconds
        cookie.setMaxAge((int) (expiration/60000));
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        return cookie;
    }
    @PostMapping("/create")
    public ResponseEntity<String> createAccount(@RequestBody AccountRequestDTO accountRequestDTO, HttpServletResponse response) {

       SessionResponseDTO results = accountService.createAccount(accountRequestDTO);

        if(results == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("At least one request is invalid");
        }

        response.addCookie(setUpTokenCookie(results.token(), results.expiresIn()));
        return ResponseEntity.status(HttpStatus.CREATED).body("Account successfully created");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO loginRequestDTO, HttpServletResponse response) {

        SessionResponseDTO results = accountService.login(loginRequestDTO);

        if(results == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
        } else if(results.token() == null && results.expiresIn() == -1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password");
        }

        response.addCookie(setUpTokenCookie(results.token(), results.expiresIn()));
        return ResponseEntity.status(HttpStatus.OK).body("Login successful");
    }

    @PostMapping("/checkEmail")
    public ResponseEntity<String> checkEmail(@RequestBody AccountRequestDTO accountRequestDTO) {

        switch (accountService.checkEmail(accountRequestDTO)) {
            case -1:
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already associated with an account");

            case -2:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email format is invalid");

            default:
                return ResponseEntity.status(HttpStatus.OK).body("Email format is valid and not associated with an account");
        }
    }

    @GetMapping("/getData")
    public ResponseEntity<AccountResponseDTO> getAccountData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(!authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        AccountResponseDTO accountResponseDTO = accountService.getAccountData(authentication);
        if(accountResponseDTO == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.status(HttpStatus.OK).body(accountResponseDTO);
    }

    @PutMapping("/update/username")
    public ResponseEntity<String> updateUsername(@RequestBody UpdateUsernameDTO updateUsernameDTO){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(!authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        switch (accountService.updateUsername(updateUsernameDTO, authentication)) {
            case -1:
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            case -2:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username not valid");
            default:
                return ResponseEntity.status(HttpStatus.OK).body("Username successfully updated");
        }
    }

    @DeleteMapping("/deleteAccount")
    public ResponseEntity<String> deleteAccount(@RequestBody AccountDeleteRequestDTO deleteRequestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(!authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        switch(accountService.deleteAccount(deleteRequestDTO, authentication)) {
            case -1:
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            case -2:
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            default:
                return ResponseEntity.status(HttpStatus.OK).body("Account successfully deleted");
        }
    }
}
