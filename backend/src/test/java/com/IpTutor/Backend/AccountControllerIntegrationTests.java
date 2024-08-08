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
		String json = gson.toJson(setUpRegister(accountEmail, accountPassword, accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isCreated())
				.andExpect(content().string("Account successfully created"));
	}

	@Test
	public void register_fail_password() throws Exception {
		//Test 1 - no upperCase, noNumbers ,noSpecialChar
		String json = gson.toJson(setUpRegister(accountEmail, "password", accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(accountEmail);

		//Test 2 - no upperCase, noSpecialChar
		json = gson.toJson(setUpRegister(accountEmail, "password123", accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(accountEmail);

		//Test 3 - no upperCase
		json = gson.toJson(setUpRegister(accountEmail, "password!23", accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(accountEmail);

		//Test 4 - no upperCase, noNumbers
		json = gson.toJson(setUpRegister(accountEmail, "password!", accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(accountEmail);

		//Test 5 - noNumbers
		json = gson.toJson(setUpRegister(accountEmail, "Password!", accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(accountEmail);

		//Test 6 - noNumbers ,noSpecialChar
		json = gson.toJson(setUpRegister(accountEmail, "Password", accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(accountEmail);

		//Test 6 - noSpecialChar
		json = gson.toJson(setUpRegister(accountEmail, "Password123", accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
	}

	@Test
	void register_fail_email() throws Exception {
		//Test 1 - Invalid -> SpecialChars
		String email = "$test@email.org";
		String json = gson.toJson(setUpRegister(email, accountPassword, accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(email);

		//Test 2 - Invalid -> no "@"
		email = "testemail.org";
		json = gson.toJson(setUpRegister(email, accountPassword, accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(email);

		//Test 3 - Invalid -> no "."
		email = "test@emailorg";
		json = gson.toJson(setUpRegister(email, accountPassword, accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(email);

		//Test 4 - Invalid -> domain after "." is too short
		email = "test@email.o";
		json = gson.toJson(setUpRegister(email, accountPassword, accountUsername));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(email);
	}

	@Test
	void register_fail_username() throws Exception {
		//Test 1 - Invalid -> SpecialChars
		String username = "*username*";
		String json = gson.toJson(setUpRegister(accountEmail, accountPassword, username));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(accountEmail);

		//Test 2 - noLetters
		username = "#$%^&*";
		json = gson.toJson(setUpRegister(accountEmail, accountPassword, username));
		mockMvc.perform(post("/accounts/create").contentType(MediaType.APPLICATION_JSON).content(json))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("At least one request is invalid"));
		deleteAccount(accountEmail);
	}

}
