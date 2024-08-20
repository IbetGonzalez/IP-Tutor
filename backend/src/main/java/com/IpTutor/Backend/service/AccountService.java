package com.IpTutor.Backend.service;

import com.IpTutor.Backend.authentication.JwtService;
import com.IpTutor.Backend.dto.*;
import com.IpTutor.Backend.model.Account;
import com.IpTutor.Backend.repository.AccountRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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

    private final CookieService cookieService;

    private boolean checkEmailPattern(String email) {
        Pattern validEmail = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);
        Matcher matcher = validEmail.matcher(email);
        return !matcher.matches();
    }

    private boolean checkUsernamePattern(String username) {
        Pattern validUsername = Pattern.compile("(?=(?:.*[a-zA-Z]){1,})(?=(?:.*[_@!&-]){0,})(?=(?:.*[0-9]){0,})^[a-zA-Z0-9_@!&-]*$");
        Matcher matcher = validUsername.matcher(username);
        return !(matcher.matches() & username.length() >= 3 & username.length() <= 16);
    }

    private boolean checkPasswordPattern(String password) {
        Pattern validEmail = Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&-+=()])(?=\\S+$).{8,}$");
        Matcher matcher = validEmail.matcher(password);
        return !matcher.matches();
    }

    private Account getAccount() {
        return (Account) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void logInfo(String info) {
        log.info("\n----------------- " + info + " -----------------" );
    }
    public SessionResponseDTO createAccount(AccountRequestDTO accountRequestDTO) {

        if(accountRepository.findByEmail(accountRequestDTO.email()).isPresent()
                || checkEmailPattern(accountRequestDTO.email())
                || checkPasswordPattern(accountRequestDTO.password())
                || checkUsernamePattern(accountRequestDTO.username())){
            logInfo("Account creation failed");
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
        Cookie cookie = cookieService.setUpTokenCookie(jwtToken, jwtService.getExpirationTime());

        logInfo("Account successfully created");
        return new SessionResponseDTO(cookie);
    }

    public SessionResponseDTO login(LoginRequestDTO loginRequestDTO) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDTO.email(),
                        loginRequestDTO.password()
                )
        );

        Account account = accountRepository.findByEmail(loginRequestDTO.email()).orElse(null);

        if(account == null || !passwordEncoder.matches(loginRequestDTO.password(), account.getPassword())) {
            logInfo("Login failed");
            return null;
        }

        String jwtToken = jwtService.generateToken(account);
        Cookie cookie = cookieService.setUpTokenCookie(jwtToken, jwtService.getExpirationTime());

        logInfo("Successfully logged in");
        return new SessionResponseDTO(cookie);
    }

    public int checkEmail(AccountRequestDTO accountRequestDTO) {
        if(accountRepository.findByEmail(accountRequestDTO.email()).isPresent()) {
            logInfo("Email already exists");
            return -1;
        }
        if(checkEmailPattern(accountRequestDTO.email())) {
            logInfo("Email format is invalid");
            return -2;
        }

        logInfo("Email is valid and unused");
        return 0;
    }

    public int updateEmail(UpdateEmailDTO updateEmailDTO) {
        Account account = getAccount();

        if(account == null) {
            logInfo("Account not found. Cannot update email");
            return -1;
        } else if(!passwordEncoder.matches(updateEmailDTO.password(), account.getPassword())) {
            logInfo("Incorrect password. Cannot update email");
            return -2;
        } else if(checkEmailPattern(updateEmailDTO.newEmail())) {
            logInfo("Email format is invalid. Cannot update email");
            return -3;
        }

        account.setEmail(updateEmailDTO.newEmail());
        accountRepository.save(account);
        logInfo("Email successfully updated");
        return 0;
    }

    public int updatePassword(UpdatePasswordDTO updatePasswordDTO) {
        Account account = getAccount();

        if(account == null) {
            logInfo("Account not found. Cannot update password.");
            return -1;
        } else if(!passwordEncoder.matches(updatePasswordDTO.password(), account.getPassword())) {
            logInfo("Account not found. Cannot update password.");
            return -2;
        } else if(checkPasswordPattern(updatePasswordDTO.newPassword())) {
            logInfo("Password format is invalid. Cannot update password.");
            return -3;
        }

        account.setPassword(passwordEncoder.encode(updatePasswordDTO.newPassword()));
        accountRepository.save(account);
        logInfo("Password successfully updated");
        return 0;
    }

    public int updateUsername(UpdateUsernameDTO updateUsernameDTO) {
        Account account = getAccount();

        if (account == null) {
            logInfo("Account not found. Cannot update username.");
            return -1;
        } else if(checkUsernamePattern(updateUsernameDTO.username())) {
            logInfo("Username format is invalid. Cannot update username.");
            return -2;
        }

        account.setUsername(updateUsernameDTO.username());
        accountRepository.save(account);
        logInfo("Username successfully updated");
        return 0;
    }

    public AccountResponseDTO getAccountData() {
        Account account = getAccount();

        if(account == null) {
            logInfo("Account not found. Cannot get account data.");
            return null;
        }

        logInfo("Account data found");
        return new AccountResponseDTO(account.getAccountUsername(),account.getEmail(),account.getAccountCreation());
    }

    public int deleteAccount(AccountDeleteRequestDTO deleteRequestDTO) {
        Account toDelete = getAccount();

        if(toDelete == null) {
            logInfo("Account not found. Cannot delete the Account.");
            return -1;
        } else if(!passwordEncoder.matches(deleteRequestDTO.password(), toDelete.getPassword())) {
            logInfo("Password is incorrect. Cannot delete the Account.");
            return -2;
        }

        accountRepository.delete(toDelete);
        logInfo("Account successfully deleted");
        return 0;
    }

}
