package com.IpTutor.Backend;

import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.LoginRequestDTO;
import com.IpTutor.Backend.dto.UpdateUsernameDTO;
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
					"test @gmail.com"}
	};

	//TODO: Ending and starting will all special chars seems to be invalid
	private static final String[][] validPasswords = {
			{"Test 1 - starts with a number",
					"1TestPassword!"},
			{"Test 2 - starts with a special character",
					"!TestPassword1"},
			{"Test 3 - starts with all special characters",
					"!@#$%^&-+=()1Test"},
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
					"1User"}
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
		accountRepository.findByEmail("violinsrock@gmail.com").ifPresent(account -> accountRepository.delete(account));
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
	public void login_fail_email() throws Exception {
		String json = gson.toJson(setUpLogin("invalidemail@ohno.org", accountPassword));
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
			basicPostTest(setUpRegister(accountEmail, accountPassword, info[1]),
					"/accounts/create",
					status().isCreated(),
					"Account successfully created",
					accountEmail);
		}
	}

	@Test
	public void register_fail_password() throws Exception {
		String [][] test = {
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

		for (String[] info : test) {
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

}
