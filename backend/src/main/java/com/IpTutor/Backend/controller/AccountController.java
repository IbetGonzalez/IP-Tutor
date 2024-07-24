package com.IpTutor.Backend.controller;

import com.IpTutor.Backend.dto.AccountLoginRequestDTO;
import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.AccountDTO;
import com.IpTutor.Backend.dto.LoginResponseDTO;
import com.IpTutor.Backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/create")
    public ResponseEntity<AccountDTO> createAccount(@RequestBody AccountRequestDTO accountRequestDTO) {

        AccountDTO results = accountService.createAccount(accountRequestDTO);

        if(results == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(results);
    }

    @GetMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody AccountLoginRequestDTO accountLoginRequestDTO) {

        LoginResponseDTO result = accountService.login(accountLoginRequestDTO);

        if(result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } else if(result.token() == null && result.expiresIn() == -1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

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

    @PutMapping("/update/username")
    public ResponseEntity<String> updateUsername(@RequestBody AccountRequestDTO accountRequestDTO){

        switch (accountService.updateUsername(accountRequestDTO)) {
            case -1:
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            case -2:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username not valid");
            default:
                return ResponseEntity.status(HttpStatus.OK).body("Username successfully updated");
        }
    }

    @DeleteMapping("/deleteAccount")
    public ResponseEntity<String> deleteAccount(@RequestBody AccountRequestDTO accountRequestDTO) {
        if (accountService.deleteAccount(accountRequestDTO) == -1) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The account to be deleted was not found");
        }
        return ResponseEntity.status(HttpStatus.OK).body("Account successfully deleted");
    }
}
