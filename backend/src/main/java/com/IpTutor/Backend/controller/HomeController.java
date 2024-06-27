package com.IpTutor.Backend.controller;

import io.github.wimdeblauwe.htmx.spring.boot.mvc.HtmxRequest;
import io.github.wimdeblauwe.htmx.spring.boot.mvc.HxRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

    @HxRequest
    @RequestMapping("")
    public String home(Model model) {
        //model.addAttribute("Content", "homeContent.html");
        return "homeContent";
    }

    @RequestMapping("")
    public String homeHx(Model model) {
        model.addAttribute("Content", "homeContent.html");
        return "base";
    }

    @RequestMapping("/game")
    public String game(Model model) {
        return "gameContent";
    }

    @RequestMapping("/base")
    public String base(Model model) {
        return "base";
    }

    @RequestMapping("/setting")
    public String setting(Model model) {
        return "settingContent";
    }

}
