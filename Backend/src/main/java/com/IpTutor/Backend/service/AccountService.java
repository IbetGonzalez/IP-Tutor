package com.IpTutor.Backend.service;

import com.IpTutor.Backend.dto.AccountCreationDTO;
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

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {
    private final AccountRepository accountRepository;
    private final MongoTemplate mongoTemplate;

    public AccountDTO createAccount(AccountCreationDTO accountCreationDTO) {
        Account account = Account.builder()
                .email(accountCreationDTO.email())
                .username(accountCreationDTO.username())
                .password(accountCreationDTO.password())
                .build();

        account.setAccountCreation(LocalDate.now());
        account.setId(new ObjectId());

        accountRepository.save(account);
        log.info("Account successfully created");
        return new AccountDTO(account.getUsername(), account.getEmail());
    }

    public List<AccountDTO> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(account -> new AccountDTO(account.getUsername(),
                                                account.getEmail()))
                .toList();
    }

    public String updateUsername(AccountCreationDTO accountCreationDTO) {
        Query findAccount = new Query(Criteria.where("email").is(accountCreationDTO.email()));
        Update update = new Update().set("username", accountCreationDTO.username());
        UpdateResult updateResult = mongoTemplate.updateFirst(findAccount, update, Account.class);

        return "Username update: " + updateResult;
    }
    public String deleteAccount(String email) {
        Query findAccount = new Query(Criteria.where("email").is(email));
        DeleteResult deleteResult = mongoTemplate.remove(findAccount, Account.class);

        return "Account Deletion: " + deleteResult;
    }

}
