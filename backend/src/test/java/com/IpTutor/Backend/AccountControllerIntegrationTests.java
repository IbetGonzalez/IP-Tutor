package com.IpTutor.Backend;

import com.IpTutor.Backend.dto.AccountRequestDTO;
import com.IpTutor.Backend.dto.LoginRequestDTO;
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
import org.springframework.test.web.servlet.result.StatusResultMatchers;
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

	private static String accountEmail = "violinsrock@gmail.com";
	private static String accountPassword = "Password!23";
	private static String accountUsername = "theMusician";

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
		Account account = accountRepository.findByEmail("violinsrock@gmail.com").orElse(null);

		if(account != null) {
			accountRepository.delete(account);
		}
	}

	private LoginRequestDTO setUpLogin(String email, String password) {
		return new LoginRequestDTO(email, password);
	}

	private AccountRequestDTO setUpRegister(String email, String password, String username) {
		return new AccountRequestDTO(username, email, password);
	}

	private void printTestInfo(String testInfo) {
		System.out.println("\n---- " + testInfo + " ----");
	}

	private void basicTest(Object jsonObj, String path, ResultMatcher status, String result, String email) throws Exception{
		String json = gson.toJson(jsonObj);
		mockMvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status)
				.andExpect(content().string(result));
		deleteAccount(email);
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
	public void register_success() throws Exception {
		basicTest(setUpRegister(accountEmail,accountPassword,accountUsername),
				"/accounts/create",
				status().isCreated(),
				"Account successfully created",
				accountEmail);
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
		};

		for (String[] info : test) {
			printTestInfo(info[0]);
			basicTest(setUpRegister(accountEmail, info[1], accountUsername),
					"/accounts/create",
					status().isBadRequest(),
					"At least one request is invalid",
					accountEmail);
		}
	}

	@Test
	void register_fail_email() throws Exception {
		String [][] test = {
				{"Test 1 - Invalid -> SpecialChars",
						"$test@email.org"},
				{"Test 2 - Invalid -> no \"@\"",
						"testemail.org"},
				{"Test 3 - Invalid -> no \".\"",
						"test@emailorg"},
				{"Test 4 - Invalid -> domain after \".\" is too short",
						"test@email.o"}
		};

		for (String[] info : test) {
			printTestInfo(info[0]);
			basicTest(setUpRegister(info[1], accountPassword, accountUsername),
					"/accounts/create",
					status().isBadRequest(),
					"At least one request is invalid",
					info[1]);
		}
	}

	@Test
	void register_success_username() throws Exception {
		String [][] test = {
				{"Test 1 - Starts with a special character",
						"_Test_"},
				{"Test 2 - minimum length (3 chars)",
						"Min"},
				{"Test 3 - Maximum length (16 chars)",
						"Maximum123456789"}
		};

		for (String[] info : test) {
			printTestInfo(info[0]);
			basicTest(setUpRegister(accountEmail, accountPassword, info[1]),
					"/accounts/create",
					status().isCreated(),
					"Account successfully created",
					accountEmail);
		}

	}
	@Test
	void register_fail_username() throws Exception {
		String [][] test = {
				{"Test 1 - Invalid -> SpecialChars",
						"*username*"},
				{"Test 2 - noLetters",
						"#$%^&*"}
		};

		for (String[] info : test) {
			printTestInfo(info[0]);
			basicTest(setUpRegister(accountEmail, accountPassword, info[1]),
					"/accounts/create",
					status().isBadRequest(),
					"At least one request is invalid",
					accountEmail);
		}
	}

}
