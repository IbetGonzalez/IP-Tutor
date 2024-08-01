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

    @PostMapping("/create")
    public ResponseEntity<SessionResponseDTO> createAccount(@RequestBody AccountRequestDTO accountRequestDTO, HttpServletResponse response) {

       SessionResponseDTO results = accountService.createAccount(accountRequestDTO);

        if(results == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        response.addCookie(new Cookie("JwtToken", results.token()));
        return ResponseEntity.status(HttpStatus.CREATED).body(results);
    }

    @PostMapping("/login")
    public ResponseEntity<SessionResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO, HttpServletResponse response) {

        SessionResponseDTO result = accountService.login(loginRequestDTO);

        if(result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } else if(result.token() == null && result.expiresIn() == -1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        response.addCookie(new Cookie("JwtToken", result.token()));
        return ResponseEntity.status(HttpStatus.OK).body(result);
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
