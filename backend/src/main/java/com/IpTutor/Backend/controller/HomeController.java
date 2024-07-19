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

    @RequestMapping("")
    public String home(Model model, HtmxRequest hxRequest) {
        if(hxRequest.isHtmxRequest()){
            return "homeContent";
        }

        model.addAttribute("content", "homeContent");
        return "base";
    }

    @RequestMapping("/{name}")
    public String slug(@PathVariable String name, Model model, HtmxRequest hxRequest) {
        if(name.equals("settings")) {
            return "redirect:/unauthorized";
        }

        if(hxRequest.isHtmxRequest()) {
            return name + "Content";
        }

        model.addAttribute("content", name + "Content");
        return "base";
    }

    @RequestMapping("/games/{name}")
    public String gamesSlug(@PathVariable String name, Model model, HtmxRequest hxRequest) {

        if(hxRequest.isHtmxRequest()){
            return "/games/" + name;
        }

        model.addAttribute("content", "/games/" + name);
        return "base";
    }

    @RequestMapping("/test/register")
    public String registerTest(Model model, HtmxRequest hxRequest) {

        if(hxRequest.isHtmxRequest()) {
            return "registerContent";
        }

        model.addAttribute("content", "registerContent");
        return "base";
    }

    @GetMapping("/unauthorized")
    public ResponseEntity<String> getNotImplemented() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login Required");
    }
}
