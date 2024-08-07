package com.IpTutor.Backend.controller;

import com.IpTutor.Backend.authentication.JwtService;
import com.IpTutor.Backend.model.Account;
import com.IpTutor.Backend.service.CookieService;
import io.github.wimdeblauwe.htmx.spring.boot.mvc.HtmxRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final CookieService cookieService;
    private void checkAuthentication(HttpServletResponse response) {
        if(!SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            response.addCookie(cookieService.deleteJwtToken().jwt_token());
        }
    }

    @RequestMapping("")
    public String home(Model model, HtmxRequest hxRequest, HttpServletResponse response) {

        checkAuthentication(response);

        if(hxRequest.isHtmxRequest()){
            return "homeContent";
        }

        model.addAttribute("content", "homeContent");
        return "base";
    }

    @RequestMapping("/{name}")
    public String slug(@PathVariable String name, Model model, HtmxRequest hxRequest, HttpServletResponse response) {

        checkAuthentication(response);

        if(hxRequest.isHtmxRequest()) {
            return name + "Content";
        }

        model.addAttribute("content", name + "Content");
        return "base";
    }

    @RequestMapping("/games/{name}")
    public String gamesSlug(@PathVariable String name, Model model, HtmxRequest hxRequest, HttpServletResponse response) {

        checkAuthentication(response);

        if(hxRequest.isHtmxRequest()){
            return "/games/" + name;
        }

        model.addAttribute("content", "/games/" + name);
        return "base";
    }
}
