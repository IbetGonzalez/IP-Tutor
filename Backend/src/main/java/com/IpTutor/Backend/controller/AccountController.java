package com.IpTutor.Backend.controller;

import com.IpTutor.Backend.dto.AccountCreationDTO;
import com.IpTutor.Backend.dto.AccountDTO;
import com.IpTutor.Backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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
    public AccountDTO createAccount(@RequestBody AccountCreationDTO accountCreationDTO) {
        return accountService.createAccount(accountCreationDTO);
    }

    @GetMapping("/getAll")
    @ResponseStatus(HttpStatus.OK)
    public List<AccountDTO> getAllAccounts() {return accountService.getAllAccounts();}

    @PutMapping("/update/username")
    @ResponseStatus(HttpStatus.OK)
    public String updateUsername(@RequestBody AccountCreationDTO accountCreationDTO){
        return accountService.updateUsername(accountCreationDTO);
    }

    @DeleteMapping("/delete/{email}")
    @ResponseStatus(HttpStatus.OK)
    public String deleteAccount(@PathVariable String email) {
        return accountService.deleteAccount(email);
    }
}
