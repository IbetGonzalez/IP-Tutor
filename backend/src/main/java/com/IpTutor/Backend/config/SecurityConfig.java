package com.IpTutor.Backend.config;

import com.IpTutor.Backend.authentication.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
      return http.authorizeHttpRequests(auth -> auth
                      .requestMatchers("/").permitAll()
                      .requestMatchers("/login").permitAll()
                      .requestMatchers("/register").permitAll()
                      .requestMatchers("/accounts/login").permitAll()
                      .requestMatchers("/accounts/create").permitAll()
                      .anyRequest().authenticated()
              )
              .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
              .authenticationProvider(authenticationProvider)
              .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
              .csrf(AbstractHttpConfigurer::disable)
              .formLogin(form -> form.defaultSuccessUrl("/", true).loginPage("/login"))
              .logout(config -> config.logoutSuccessUrl("/").logoutUrl("/logout"))
              .build();
    }

}
