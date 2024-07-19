package com.IpTutor.Backend.controller;

import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.AccountDTO;
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
    @ResponseStatus(HttpStatus.CREATED)
    public AccountDTO createAccount(@RequestBody AccountRequestDTO accountRequestDTO) {
        return accountService.createAccount(accountRequestDTO);
    }

    @GetMapping("/getAll")
    @ResponseStatus(HttpStatus.OK)
    public List<AccountDTO> getAllAccounts() {return accountService.getAllAccounts();}

    @GetMapping("/getAccount")
    @ResponseStatus(HttpStatus.OK)
    public AccountDTO getAccount(@RequestBody AccountRequestDTO accountRequestDTO) {
        return accountService.getAccount(accountRequestDTO);
    }

    @PostMapping("/checkEmail")
    public ResponseEntity<String> checkEmail(@RequestBody AccountRequestDTO accountRequestDTO) {
        if (accountService.checkEmail(accountRequestDTO)) {
            return ResponseEntity.status(HttpStatus.OK).body("Account found");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No account found");
    }

    @GetMapping("/checkUsername")
    @ResponseStatus(HttpStatus.OK)
    public boolean checkUsername(@RequestBody AccountRequestDTO accountRequestDTO) {
        return accountService.checkUsername(accountRequestDTO);
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
