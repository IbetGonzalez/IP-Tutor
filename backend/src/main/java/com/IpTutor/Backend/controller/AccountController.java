package com.IpTutor.Backend.controller;

import com.IpTutor.Backend.dto.*;
import com.IpTutor.Backend.service.AccountService;
import com.IpTutor.Backend.service.CookieService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final CookieService cookieService;

    private boolean authenticationIsInvalid(HttpServletResponse response) {
        if(SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            return false;
        }

        response.addCookie(cookieService.deleteJwtToken().jwt_token());
        return true;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createAccount(@RequestBody AccountRequestDTO accountRequestDTO, HttpServletResponse response) {

       SessionResponseDTO results = accountService.createAccount(accountRequestDTO);

        if(results == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("At least one request is invalid");
        }

        response.addCookie(results.jwt_token());
        return ResponseEntity.status(HttpStatus.CREATED).body("Account successfully created");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO loginRequestDTO, HttpServletResponse response) {

        SessionResponseDTO results = accountService.login(loginRequestDTO);

        if(results == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect email or password");
        }

        response.addCookie(results.jwt_token());
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

    @PutMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        response.addCookie(cookieService.deleteJwtToken().jwt_token());
        return ResponseEntity.status(HttpStatus.OK).body("Successfully logged out");
    }

    @PutMapping("/update/username")
    public ResponseEntity<String> updateUsername(@RequestBody UpdateUsernameDTO updateUsernameDTO, HttpServletRequest request, HttpServletResponse response){

        if(authenticationIsInvalid(response)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        switch (accountService.updateUsername(updateUsernameDTO)) {
            case -1:
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            case -2:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username not valid");
            default:
                return ResponseEntity.status(HttpStatus.OK).body("Username successfully updated");
        }
    }

    @GetMapping("/getData")
    public ResponseEntity<AccountResponseDTO> getAccountData(HttpServletRequest request, HttpServletResponse response) {

        if(authenticationIsInvalid(response)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        AccountResponseDTO accountResponseDTO = accountService.getAccountData();
        if(accountResponseDTO == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.status(HttpStatus.OK).body(accountResponseDTO);
    }

    @DeleteMapping("/deleteAccount")
    public ResponseEntity<String> deleteAccount(@RequestBody AccountDeleteRequestDTO deleteRequestDTO, HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authenticationIsInvalid(response)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        switch(accountService.deleteAccount(deleteRequestDTO)) {
            case -1:
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            case -2:
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            default:
                response.addCookie(cookieService.deleteJwtToken().jwt_token());
                return ResponseEntity.status(HttpStatus.OK).body("Account successfully deleted");
        }
    }
}
