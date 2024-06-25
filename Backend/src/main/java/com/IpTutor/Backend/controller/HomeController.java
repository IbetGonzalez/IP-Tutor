package com.IpTutor.Backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {
    @RequestMapping("/home")
    public String home(Model model) {
        return "homeContent";
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
