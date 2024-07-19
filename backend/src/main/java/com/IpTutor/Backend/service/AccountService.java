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
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.io.Console;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService implements UserDetailsService {
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

        if(checkExistence("username", accountRequestDTO.username()) || checkExistence("email", accountRequestDTO.email())){
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

    public AccountDTO getAccount(AccountRequestDTO accountRequestDTO) {
        Query findAccount = new Query(Criteria.where("email").is(accountRequestDTO.email()));
        List<Account> account = mongoTemplate.find(findAccount, Account.class);

        if(account.isEmpty()) {
            return null;
        }

        return new AccountDTO(account.get(0).getUsername(), account.get(0).getEmail(), account.get(0).getAccountCreation());
    }

    public boolean checkEmail(AccountRequestDTO accountRequestDTO) {
        return checkExistence("email", accountRequestDTO.email());
    }

    public boolean checkUsername(AccountRequestDTO accountRequestDTO) {
        return checkExistence("username", accountRequestDTO.username());
    }

    public String updateUsername(AccountRequestDTO accountRequestDTO) {
        Query findAccount = new Query(Criteria.where("email").is(accountRequestDTO.email()));
        Update update = new Update().set("username", accountRequestDTO.username());
        UpdateResult updateResult = mongoTemplate.updateFirst(findAccount, update, Account.class);

        return "Username update: " + updateResult;
    }

    public Long deleteAccount(AccountRequestDTO accountRequestDTO) {
        Query findAccount = new Query(Criteria.where("email").is(accountRequestDTO.email()));
        DeleteResult deleteResult = mongoTemplate.remove(findAccount, Account.class);
        return deleteResult.getDeletedCount();
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Query findAccount = new Query(Criteria.where("email").is(email));
        List<Account> accounts = mongoTemplate.find(findAccount, Account.class);

        if(!accounts.isEmpty()) {
            Account account = accounts.get(0);
            var accountUser = User.withUsername(account.getEmail())
                    .password(account.getPassword())
                    .roles("USER")
                    .build();

            return accountUser;
        }
        return null;
    }
}
