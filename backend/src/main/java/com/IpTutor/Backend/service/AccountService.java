package com.IpTutor.Backend.service;

import com.IpTutor.Backend.authentication.JwtService;
import com.IpTutor.Backend.dto.LoginRequestDTO;
import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.AccountDTO;
import com.IpTutor.Backend.dto.LoginResponseDTO;
import com.IpTutor.Backend.model.Account;
import com.IpTutor.Backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService{
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    private boolean checkEmailPattern(String email) {
        Pattern validEmail = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);
        Matcher matcher = validEmail.matcher(email);
        return !matcher.matches();
    }

    private boolean checkUsernamePattern(String username) {
        Pattern validEmail = Pattern.compile("^[A-Za-z0-9_]+$");
        Matcher matcher = validEmail.matcher(username);
        return !matcher.matches();
    }

    private boolean checkPasswordPattern(String password) {
        Pattern validEmail = Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&-+=()])(?=\\S+$).{8,}$");
        Matcher matcher = validEmail.matcher(password);
        return !matcher.matches();
    }

    public AccountDTO createAccount(AccountRequestDTO accountRequestDTO) {

        if(accountRepository.findByEmail(accountRequestDTO.email()).isPresent()
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

        //TODO: Keep log.info or remove it
        log.info("Account successfully created");
        return new AccountDTO(account.getUsername(), account.getEmail(), account.getAccountCreation());
    }

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDTO.email(),
                        loginRequestDTO.password()
                )
        );

        Account account = accountRepository.findByEmail(loginRequestDTO.email()).orElse(null);

        if(account == null) {
            return null;
        } else if(!passwordEncoder.matches(loginRequestDTO.password(), account.getPassword())) {
            return new LoginResponseDTO(null,-1);
        }

        String jwtToken = jwtService.generateToken(account);

        return new LoginResponseDTO(jwtToken, jwtService.getExpirationTime());
    }

    public int checkEmail(AccountRequestDTO accountRequestDTO) {

        if(accountRepository.findByEmail(accountRequestDTO.email()).isPresent()) {
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

}
