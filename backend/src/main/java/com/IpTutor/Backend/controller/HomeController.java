package com.IpTutor.Backend.controller;

import io.github.wimdeblauwe.htmx.spring.boot.mvc.HtmxRequest;
import io.github.wimdeblauwe.htmx.spring.boot.mvc.HxRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;

@Controller
public class HomeController {

    @HxRequest
    @RequestMapping("")
    public String homeHx(Model model) {
        return "homeContent";
    }

    @HxRequest
    @RequestMapping("/{name}")
    public String slugHx(@PathVariable String name, Model model) {
        if(name.equals("settings")) {
            return "redirect:/unauthorized";
        }

        return name + "Content";
    }

    @HxRequest
    @RequestMapping("/games/{name}")
    public String gamesSlugHx(@PathVariable String name, Model model) {
        return "games/" + name;
    }

    @RequestMapping("")
    public String home(Model model) {
        model.addAttribute("content", "homeContent");
        return "base";
    }

    @RequestMapping("/{name}")
    public String slug(@PathVariable String name, Model model) {
        if(name.equals("settings")) {
            return "redirect:/unauthorized";
        }

        model.addAttribute("content", name + "Content");
        return "base";
    }

    @RequestMapping("/games/{name}")
    public String gamesSlug(@PathVariable String name, Model model) {
        model.addAttribute("content", "/games/" + name);
        return "base";
    }

    @RequestMapping("/test/register")
    public String registerTest() {
        return "registerTemp";
    }

    @GetMapping("/unauthorized")
    public ResponseEntity<String> getNotImplemented() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login Required");
    }
}
