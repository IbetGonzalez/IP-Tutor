package com.IpTutor.Backend.service;

import com.IpTutor.Backend.authentication.JwtService;
import com.IpTutor.Backend.dto.*;
import com.IpTutor.Backend.model.Account;
import com.IpTutor.Backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    public SessionResponseDTO createAccount(AccountRequestDTO accountRequestDTO) {

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

        String jwtToken = jwtService.generateToken(account);

        log.info("Account successfully created");
        return new SessionResponseDTO(jwtToken, jwtService.getExpirationTime());
    }

    public SessionResponseDTO login(LoginRequestDTO loginRequestDTO) {

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
            return new SessionResponseDTO(null,-1);
        }

        String jwtToken = jwtService.generateToken(account);

        log.info("Successfully logged in");
        return new SessionResponseDTO(jwtToken, jwtService.getExpirationTime());
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

    public AccountResponseDTO getAccountData(Authentication authentication) {
        Account account = (Account) authentication.getPrincipal();

        if(account == null) {
            return null;
        }

        return new AccountResponseDTO(account.getAccountUsername(),account.getEmail(),account.getAccountCreation());
    }

    public int updateUsername(UpdateUsernameDTO updateUsernameDTO, Authentication authentication) {
        Account account = (Account) authentication.getPrincipal();

        if (account == null) {
            return -1;
        } else if(checkUsernamePattern(updateUsernameDTO.username())) {
            return -2;
        }

        account.setUsername(updateUsernameDTO.username());
        accountRepository.save(account);
        return 0;
    }

    public int deleteAccount(AccountDeleteRequestDTO deleteRequestDTO, Authentication authentication) {
        Account toDelete = (Account) authentication.getPrincipal();

        if(toDelete == null) {
            return -1;
        }
        if(!passwordEncoder.matches(deleteRequestDTO.password(), toDelete.getPassword()))
        {
            return -2;
        }

        accountRepository.delete(toDelete);
        return 0;
    }

}
