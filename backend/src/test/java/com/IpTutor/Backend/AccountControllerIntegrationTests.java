package com.IpTutor.Backend;

import com.IpTutor.Backend.dto.*;
import com.IpTutor.Backend.model.Account;
import com.IpTutor.Backend.repository.AccountRepository;
import com.google.gson.Gson;
import jakarta.servlet.ServletContext;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
@SpringBootTest
class AccountControllerIntegrationTests {
	@Autowired
	private WebApplicationContext webApplicationContext;
	@Autowired
	private AccountRepository accountRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;
	private MockMvc mockMvc;

	private static final String accountEmail = "violinsrock@gmail.com";
	private static final String accountPassword = "Password!23";
	private static final String accountUsername = "theMusician";
	private static final String[][] invalidEmails =  {
			{"Test 1 - SpecialChars",
					"$test@email.org"},
			{"Test 2 - no \"@\"",
					"testemail.org"},
			{"Test 3 - no \".\"",
					"test@emailorg"},
			{"Test 4 - domain after \".\" is too short",
					"test@email.o"},
			{"Test 5 - has a space",
					"test @gmail.com"},
			{"Test 4 - domain after \".\" is too long",
					"test@email.tooolong"}
	};
    private static final String [][] invalidPasswords = {
            {"Test 1 - no upperCase, noNumbers ,noSpecialChar",
                    "password"},
            {"Test 2 - no upperCase, noSpecialChar",
                    "password123"},
            {"Test 3 - no upperCase",
                    "password!23"},
            {"Test 4 - no upperCase, noNumbers",
                    "password!"},
            {"Test 5 - noNumbers",
                    "Password!"},
            {"Test 6 - noNumbers ,noSpecialChar",
                    "Password"},
            {"Test 7 - noSpecialChar",
                    "Password123"},
            {"Test 8 - less than min length",
                    "2Sh0rt!"},
            {"Test 9 - has a space",
                    "pass word"}
    };
	private static final String[][] invalidUsernames = {
			{"Test 1 - SpecialChars",
					"*username*"},
			{"Test 2 -  noLetters",
					"#$%^&*"},
			{"Test 3 - less than minimum length (3 chars)",
					"hi"},
			{"Test 4 - greater than minimum length (16 chars)",
					"Maximum123456789!"},
			{"Test 5 - onlyNumbers",
					"1234"},
			{"Test 6 - has a space",
					"user name"}
	};
    private static final String[][] validEmails = {
            {"Test 1 - has a dot in the middle of the email before the \"@\"",
                    "test.this@email.com"},
			{"Test 2 - has numbers in it before the \"@\"",
					"email123@test.org"},
			{"Test 3 - has numbers in it after the \"@\"",
					"email@test123.org"},
			{"Test 4 - short email",
					"a@a.com"}
    };
	private static final String[][] validPasswords = {
			{"Test 1 - starts with a number",
					"1TestPassword!"},
			{"Test 2 - starts with a special character",
					"!TestPassword1"},
			{"Test 3 - starts with all special characters",
					"!@#$%^&-+=()Test1"},
			{"Test 4 - starts with a lowercase",
					"testPassword1!"},
			{"Test 5 - ends with all special characters",
					"Test1!@#$%^&-+=()"}
	};
	private final String [][] validUsernames = {
			{"Test 1 - Starts with a special character",
					"_Test_"},
			{"Test 2 - minimum length (3 chars)",
					"Min"},
			{"Test 3 - Maximum length (16 chars)",
					"Maximum123456789"},
			{"Test 4 - Starts with a number",
					"1User"},
			{"Test 5 - Starts with a series of numbers",
					"123456User"},
			{"Test 6 - Starts with a series of special characters",
					"_@!&-User"}
	};

	private Account setUpAccount() {
		Account account = accountRepository.findByEmail(accountEmail).orElse(null);

		if(account == null) {
			account = new Account();
			account.setUsername(accountUsername);
			account.setEmail(accountEmail);
			account.setPassword(passwordEncoder.encode(accountPassword));
			account.setAccountCreation(LocalDate.now());
			account.setId(new ObjectId());
			account = accountRepository.save(account);
		}

		return account;
	}

	private void deleteAccount(String email) {
		accountRepository.findByEmail(email).ifPresent(account -> accountRepository.delete(account));
	}

	private LoginRequestDTO setUpLogin(String email, String password) {
		return new LoginRequestDTO(email, password);
	}

	private AccountRequestDTO setUpRegister(String email, String password, String username) {
		return new AccountRequestDTO(username, email, password);
	}

	private UpdateUsernameDTO setUpUpdateUsername(String username) {
		return new UpdateUsernameDTO(username);
	}

	private AccountDeleteRequestDTO setUpDeleteAccount(String password) {
		return new AccountDeleteRequestDTO(password);
	}

	private void printTestInfo(String testInfo) {
		System.out.println("\n---- " + testInfo + " ----");
	}

	private void basicPostTest(Object jsonObj, String path, ResultMatcher status, String result, String email) throws Exception{
		String json = gson.toJson(jsonObj);
		mockMvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status)
				.andExpect(content().string(result));
		deleteAccount(email);
	}

	private void authorizedPutTest(Object jsonObj, String path, ResultMatcher status, String result) throws Exception{
		String json = gson.toJson(jsonObj);
		mockMvc.perform(put(path).with(user(setUpAccount()))
				.contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status)
				.andExpect(content().string(result));
	}

	@BeforeEach
	public void setup() throws Exception {
		this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).apply(springSecurity()).build();
	}

	@AfterEach
	public void cleanUp() throws Exception {
		deleteAccount(accountEmail);
	}

	Gson gson = new Gson();

	@Test
	public void givenWac_whenServletContext_thenItProvidesGreetController() {
		ServletContext servletContext = webApplicationContext.getServletContext();

		assertNotNull(servletContext);
		assertTrue(servletContext instanceof MockServletContext);
		assertNotNull(webApplicationContext.getBean("accountController"));
	}

	@Test
	public void login_success() throws Exception {
		setUpAccount();
		String json = gson.toJson(setUpLogin(accountEmail, accountPassword));
		mockMvc.perform(post("/accounts/login").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isOk());
	}

	@Test
	public void login_success_email_noCaseSensitivity() throws Exception {
		setUpAccount();
		String json = gson.toJson(setUpLogin(accountEmail.toUpperCase(), accountPassword));
		mockMvc.perform(post("/accounts/login").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isOk());
	}

	@Test
	public void login_fail_email() throws Exception {
        //Makes sure that the account does not exist
        setUpAccount();
        deleteAccount(accountEmail);

		String json = gson.toJson(setUpLogin(accountEmail, accountPassword));
		mockMvc.perform(post("/accounts/login").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.description").value("The username or password is incorrect"));
	}

	@Test
	public void login_fail_password() throws Exception {
		setUpAccount();
		String json = gson.toJson(setUpLogin(accountEmail, "not" + accountPassword));
		mockMvc.perform(post("/accounts/login").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.description").value("The username or password is incorrect"));
	}

	@Test
	public void register_success_general() throws Exception {
		basicPostTest(setUpRegister(accountEmail,accountPassword,accountUsername),
				"/accounts/create",
				status().isCreated(),
				"Account successfully created",
				accountEmail);
	}

    @Test
    public void register_success_email() throws Exception {
        for (String[] info : validEmails) {
            printTestInfo(info[0]);
            basicPostTest(setUpRegister(info[1], accountPassword, accountUsername),
                    "/accounts/create",
                    status().isCreated(),
                    "Account successfully created",
                    info[1]);
        }

    }
	@Test
	void register_success_username() throws Exception {
		for (String[] info : validUsernames) {
			printTestInfo(info[0]);
			basicPostTest(setUpRegister(accountEmail, accountPassword, info[1]),
					"/accounts/create",
					status().isCreated(),
					"Account successfully created",
					accountEmail);
		}

	}

	@Test
	void register_success_password() throws Exception {
		for (String[] info : validPasswords) {
			printTestInfo(info[0]);
			basicPostTest(setUpRegister(accountEmail, info[1], accountUsername),
					"/accounts/create",
					status().isCreated(),
					"Account successfully created",
					accountEmail);
		}
	}

	@Test
	public void register_fail_password() throws Exception {
		for (String[] info : invalidPasswords) {
			printTestInfo(info[0]);
			basicPostTest(setUpRegister(accountEmail, info[1], accountUsername),
					"/accounts/create",
					status().isBadRequest(),
					"At least one request is invalid",
					accountEmail);
		}
	}

	@Test
	void register_fail_email() throws Exception {
		for (String[] info : invalidEmails) {
			printTestInfo(info[0]);
			basicPostTest(setUpRegister(info[1], accountPassword, accountUsername),
					"/accounts/create",
					status().isBadRequest(),
					"At least one request is invalid",
					info[1]);
		}
	}

	@Test
	void register_fail_username() throws Exception {
		for (String[] info : invalidUsernames) {
			printTestInfo(info[0]);
			basicPostTest(setUpRegister(accountEmail, accountPassword, info[1]),
					"/accounts/create",
					status().isBadRequest(),
					"At least one request is invalid",
					accountEmail);
		}
	}

	@Test
	void checkEmail_success() throws Exception {
		for (String[] info : validEmails) {
			printTestInfo(info[0]);
			basicPostTest(setUpRegister(info[1], accountPassword, accountUsername),
					"/accounts/checkEmail",
					status().isOk(),
					"Email format is valid and not associated with an account",
					info[1]);
		}
	}

	@Test
	void checkEmail_fail_invalid() throws Exception {
		for (String[] info : invalidEmails) {
			printTestInfo(info[0]);
			basicPostTest(setUpRegister(info[1], accountPassword, accountUsername),
					"/accounts/checkEmail",
					status().isBadRequest(),
					"Email format is invalid",
					info[1]);
		}
	}

	@Test
	void checkEmail_fail_conflict() throws Exception {
		printTestInfo("Account with the email exists");
		setUpAccount();
		basicPostTest(setUpRegister(accountEmail, accountPassword, accountUsername),
				"/accounts/checkEmail",
				status().isConflict(),
				"Email already associated with an account",
				accountEmail);
	}

	private UpdateEmailDTO setUpUpdateEmail(String newEmail, String password) {
		return new UpdateEmailDTO(newEmail, password);
	}

	private UpdatePasswordDTO setUpUpdatePassword(String newPassword, String password) {
		return new UpdatePasswordDTO(newPassword, password);
	}

	@Test
	void updateEmail_successful() throws Exception {
		String email = "newEmail@here.org";

		authorizedPutTest(setUpUpdateEmail(email, accountPassword),
				"/accounts/update/email",
				status().isOk(),
				"Email successfully updated");

		Account account = (Account) accountRepository.findByEmail(email).orElse(null);
		assertNotNull(account);
		assertEquals(account.getEmail(), email);

		deleteAccount(email);
	}

	@Test
	void updateEmail_fail_password() throws Exception {
		String email = "newEmail@here.org";

		authorizedPutTest(setUpUpdateEmail(email, "notAccountPassword"),
				"/accounts/update/email",
				status().isUnauthorized(),
				"Incorrect password");

		Account account = (Account) accountRepository.findByEmail(accountEmail).orElse(null);
		assertNotNull(account);
		assertNotEquals(account.getEmail(), email);
	}

	@Test
	void updateEmail_fail_emails() throws Exception {
		for (String[] info : invalidEmails) {
			printTestInfo(info[0]);
			authorizedPutTest(setUpUpdateEmail(info[1], accountPassword),
					"/accounts/update/email",
					status().isBadRequest(),
					"Email not valid");

			Account account = (Account) accountRepository.findByEmail(accountEmail).orElse(null);
			assertNotNull(account);
			assertNotEquals(account.getEmail(), info[1]);

			deleteAccount(info[1]);
		}
	}

	@Test
	void updatePassword_successful() throws Exception {
		String newPassword = "NewPassword1!";

		authorizedPutTest(setUpUpdatePassword(newPassword, accountPassword),
				"/accounts/update/password",
				status().isOk(),
				"Password successfully updated");

		Account account = accountRepository.findByEmail(accountEmail).orElse(null);
		assertNotNull(account);
		assertTrue(passwordEncoder.matches(newPassword, account.getPassword()));
	}

	@Test
	void updatePassword_fail_accountPassword() throws Exception {
		String newPassword = "NewPassword1!";

		authorizedPutTest(setUpUpdatePassword(newPassword, "notAccountPassword"),
				"/accounts/update/password",
				status().isUnauthorized(),
				"Incorrect password");

		Account account = accountRepository.findByEmail(accountEmail).orElse(null);
		assertNotNull(account);
		assertFalse(passwordEncoder.matches(newPassword, account.getPassword()));
	}

	@Test
	void updatePassword_fail_invalidPasswords() throws Exception {
		for (String[] info : invalidPasswords) {
			authorizedPutTest(setUpUpdatePassword(info[1], accountPassword),
					"/accounts/update/password",
					status().isBadRequest(),
					"Password is not valid");

			Account account = accountRepository.findByEmail(accountEmail).orElse(null);
			assertNotNull(account);
			assertFalse(passwordEncoder.matches(info[1], account.getPassword()));
		}
	}

	@Test
	void updateUsername_success() throws Exception {
		String username = "newUsername";

		authorizedPutTest(setUpUpdateUsername(username),
				"/accounts/update/username",
				status().isOk(),
				"Username successfully updated");

		Account account = (Account) accountRepository.findByEmail(accountEmail).orElse(null);
		assertNotNull(account);
		assertEquals(account.getAccountUsername(), username);
	}

	@Test
	void updateUsername_fail() throws Exception {
		for (String[] info : invalidUsernames) {
			printTestInfo(info[0]);

			authorizedPutTest(setUpUpdateUsername(info[1]),
					"/accounts/update/username",
					status().isBadRequest(),
					"Username not valid");

			Account account = (Account) accountRepository.findByEmail(accountEmail).orElse(null);
			assertNotNull(account);
			assertNotEquals(account.getAccountUsername(), info[1]);
		}
	}

	@Test
	void getData_success() throws Exception {
		mockMvc.perform(get("/accounts/getData").with(user(setUpAccount())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value(accountUsername))
				.andExpect(jsonPath("$.email").value(accountEmail))
				.andExpect(jsonPath("$.accountCreation").isNotEmpty());
	}

	@Test
	void deleteAccount_success() throws Exception {
		String json = gson.toJson(setUpDeleteAccount(accountPassword));
		mockMvc.perform(delete("/accounts/deleteAccount").with(user(setUpAccount()))
				.contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isOk())
				.andExpect(content().string("Account successfully deleted"));

		Account account = (Account) accountRepository.findByEmail(accountEmail).orElse(null);
		assertNull(account);
	}

	@Test
	void deleteAccount_fail_invalidPassword() throws Exception {
		String json = gson.toJson(setUpDeleteAccount("notPassword"));
		mockMvc.perform(delete("/accounts/deleteAccount").with(user(setUpAccount()))
						.contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isUnauthorized())
				.andExpect(content().string("Invalid password"));

		Account account = (Account) accountRepository.findByEmail(accountEmail).orElse(null);
		assertNotNull(account);
	}

	@Test
	void deleteAccount_fail_notAuthorized_accountDoesNotExists() throws Exception {

		String json = gson.toJson(setUpDeleteAccount(accountPassword));
		mockMvc.perform(delete("/accounts/deleteAccount").with(anonymous())
						.contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isFound());

	}
}
