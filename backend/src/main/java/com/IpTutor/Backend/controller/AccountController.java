package com.IpTutor.Backend.controller;

import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.AccountDTO;
import com.IpTutor.Backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/getAccount/{email}")
    @ResponseStatus(HttpStatus.OK)
    public AccountDTO getAccount(@PathVariable String email) {
        return accountService.getAccount(email);
    }

    @GetMapping("/checkEmail/{email}")
    @ResponseStatus(HttpStatus.OK)
    public boolean checkEmail(@PathVariable String email) {
        return accountService.checkEmail(email);
    }

    @GetMapping("/checkUsername/{username}")
    @ResponseStatus(HttpStatus.OK)
    public boolean checkUsername(@PathVariable String username) {
        return accountService.checkUsername(username);
    }

    @PutMapping("/update/username")
    @ResponseStatus(HttpStatus.OK)
    public String updateUsername(@RequestBody AccountRequestDTO accountRequestDTO){
        return accountService.updateUsername(accountRequestDTO);

    }

    @DeleteMapping("/delete/{email}")
    @ResponseStatus(HttpStatus.OK)
    public String deleteAccount(@PathVariable String email) {
        return accountService.deleteAccount(email);
    }
}
