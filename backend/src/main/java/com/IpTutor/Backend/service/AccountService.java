package com.IpTutor.Backend.service;

import com.IpTutor.Backend.authTest.JwtService;
import com.IpTutor.Backend.dto.AccountLoginRequestDTO;
import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.AccountDTO;
import com.IpTutor.Backend.dto.LoginResponseDTO;
import com.IpTutor.Backend.model.Account;
import com.IpTutor.Backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService{
    private final AccountRepository accountRepository;
    private final MongoTemplate mongoTemplate;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    private boolean checkExistence(String key, String var) {
        Query find = new Query(Criteria.where(key).is(var));
        if(mongoTemplate.find(find, Account.class).isEmpty()) {
            return false;
        }

        return true;
    }

    private boolean checkEmailPattern(String email) {
        Pattern validEmail = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);
        Matcher matcher = validEmail.matcher(email);
        return !matcher.matches();
    }

    private boolean checkUsernamePattern(String username) {
        Pattern validEmail = Pattern.compile("^[A-Za-z0-9]+$");
        Matcher matcher = validEmail.matcher(username);
        return !matcher.matches();
    }

    private boolean checkPasswordPattern(String password) {
        Pattern validEmail = Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&-+=()])(?=\\S+$).{8,}$");
        Matcher matcher = validEmail.matcher(password);
        return !matcher.matches();
    }

    public AccountDTO createAccount(AccountRequestDTO accountRequestDTO) {

        if(checkExistence("email", accountRequestDTO.email())
                || checkEmailPattern(accountRequestDTO.email())
                || checkPasswordPattern(accountRequestDTO.password())
                || checkUsernamePattern(accountRequestDTO.username())){
            return null;
        }

        Account account = Account.builder()
                .email(accountRequestDTO.email())
                .username(accountRequestDTO.username())
                .password(passwordEncoder.encode(accountRequestDTO.password()))
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

    public LoginResponseDTO login(AccountLoginRequestDTO accountLoginRequestDTO) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        accountLoginRequestDTO.email(),
                        accountLoginRequestDTO.password()
                )
        );


        Query findAccount = new Query(Criteria.where("email").is(accountLoginRequestDTO.email()));
        List<Account> account = mongoTemplate.find(findAccount, Account.class);

        if(account.isEmpty()) {
            return null;
        }

        if(!passwordEncoder.matches(accountLoginRequestDTO.password(), account.get(0).getPassword())) {
            return new LoginResponseDTO(null,-1);
        }

        String jwtToken = jwtService.generateToken(account.get(0));

        return new LoginResponseDTO(jwtToken, jwtService.getExpirationTime());
    }

    public int checkEmail(AccountRequestDTO accountRequestDTO) {

        if(checkExistence("email", accountRequestDTO.email())) {
            return -1;
        }
        if(checkEmailPattern(accountRequestDTO.email())) {
            return -2;
        }

        return 0;
    }

    public int updateUsername(AccountRequestDTO accountRequestDTO) {
        Account account = accountRepository.findByEmail(accountRequestDTO.email()).orElse(null);

        if (account == null) {
            return -1;
        } else if(checkUsernamePattern(accountRequestDTO.username())) {
            return -2;
        }

        account.setUsername(accountRequestDTO.username());
        accountRepository.save(account);
        return 0;
    }

    public int deleteAccount(AccountRequestDTO accountRequestDTO) {
        Account toDelete = accountRepository.findByEmail(accountRequestDTO.email()).orElse(null);
        if(toDelete != null) {
            accountRepository.delete(toDelete);
            return 1;
        }
        return 0;
    }

    public int test(AccountRequestDTO accountRequestDTO) {
        if(checkUsernamePattern(accountRequestDTO.username())) {
            return -1;
        }
        return 0;
    }
}
