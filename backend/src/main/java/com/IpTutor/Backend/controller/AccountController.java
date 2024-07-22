package com.IpTutor.Backend.controller;

import com.IpTutor.Backend.dto.AccountLoginRequestDTO;
import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.AccountDTO;
import com.IpTutor.Backend.dto.LoginResponseDTO;
import com.IpTutor.Backend.service.AccountService;
import com.IpTutor.Backend.service.JwtService;
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
    private final JwtService jwtService;

    @PostMapping("/create")
    public ResponseEntity<AccountDTO> createAccount(@RequestBody AccountRequestDTO accountRequestDTO) {

        AccountDTO results = accountService.createAccount(accountRequestDTO);

        if(results == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(results);
    }

    @GetMapping("/getAll")
    @ResponseStatus(HttpStatus.OK)
    public List<AccountDTO> getAllAccounts() {return accountService.getAllAccounts();}

    @GetMapping("/login")
    public ResponseEntity<LoginResponseDTO> getAccount(@RequestBody AccountLoginRequestDTO accountLoginRequestDTO) {

        LoginResponseDTO result = accountService.getAccount(accountLoginRequestDTO);

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
            case 1:
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already associated with an account");

            case 2:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email format is invalid");

            default:
                return ResponseEntity.status(HttpStatus.OK).body("Email format is valid and not associated with an account");
        }

    }

    @PostMapping("/checkPassword")
    public ResponseEntity<String> checkPassword(@RequestBody AccountRequestDTO accountRequestDTO) {
        if(!accountService.checkPassword(accountRequestDTO)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Password");
        }
        return ResponseEntity.status(HttpStatus.OK).body("Valid Password");
    }

    @PutMapping("/update/username")
    @ResponseStatus(HttpStatus.OK)
    public String updateUsername(@RequestBody AccountRequestDTO accountRequestDTO){
        return accountService.updateUsername(accountRequestDTO);

    }

    @DeleteMapping("/deleteAccount")
    @ResponseStatus(HttpStatus.OK)
    public Long deleteAccount(@RequestBody AccountRequestDTO accountRequestDTO) {
        return accountService.deleteAccount(accountRequestDTO);
    }

}
