package com.IpTutor.Backend.service;

import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.AccountDTO;
import com.IpTutor.Backend.model.Account;
import com.IpTutor.Backend.repository.AccountRepository;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.io.Console;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {
    private final AccountRepository accountRepository;
    private final MongoTemplate mongoTemplate;

    private boolean checkExistence(String key, String var) {
        Query find = new Query(Criteria.where(key).is(var));
        if(mongoTemplate.find(find, Account.class).isEmpty()) {
            return false;
        }

        return true;
    }

    public AccountDTO createAccount(AccountRequestDTO accountRequestDTO) {

        if(!checkExistence("username", accountRequestDTO.username())){
            return null;
        }

        Account account = Account.builder()
                .email(accountRequestDTO.email())
                .username(accountRequestDTO.username())
                .password(accountRequestDTO.password())
                .build();

        account.setAccountCreation(LocalDate.now());
        account.setId(new ObjectId());

        accountRepository.save(account);
        log.info("Account successfully created");
        return new AccountDTO(account.getUsername(), account.getEmail(), account.getAccountCreation());
    }

    public List<AccountDTO> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(account -> new AccountDTO(account.getUsername(),
                                                account.getEmail(),
                                                account.getAccountCreation()))
                .toList();
    }

    public AccountDTO getAccount(String email) {
        Query findAccount = new Query(Criteria.where("email").is(email));
        List<Account> account = mongoTemplate.find(findAccount, Account.class);

        if(account.isEmpty()) {
            return null;
        }

        return new AccountDTO(account.get(0).getUsername(), account.get(0).getEmail(), account.get(0).getAccountCreation());
    }

    public boolean checkEmail(String email) {
        return checkExistence("email", email);
    }

    public boolean checkUsername(String username) {
        return checkExistence("username", username);
    }

    public String updateUsername(AccountRequestDTO accountRequestDTO) {
        Query findAccount = new Query(Criteria.where("email").is(accountRequestDTO.email()));
        Update update = new Update().set("username", accountRequestDTO.username());
        UpdateResult updateResult = mongoTemplate.updateFirst(findAccount, update, Account.class);

        return "Username update: " + updateResult;
    }
    public String deleteAccount(String email) {
        Query findAccount = new Query(Criteria.where("email").is(email));
        DeleteResult deleteResult = mongoTemplate.remove(findAccount, Account.class);

        return "Account Deletion: " + deleteResult;
    }

}
