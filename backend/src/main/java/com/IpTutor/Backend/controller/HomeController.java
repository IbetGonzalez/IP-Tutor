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
    public String homeHx(Model model) {
        return "homeContent";
    }

    @HxRequest
    @RequestMapping("/games")
    public String gameHx(Model model) {
        return "gameContent";
    }

    @HxRequest
    @RequestMapping("/games/tuninggame")
    public String tuningGameHx(Model model) {
        return "games/tuninggame";
    }

    @HxRequest
    @RequestMapping("/settings")
    public String settingsHx(Model model) {
        return "settingContent";
    }

    @RequestMapping("")
    public String home(Model model) {
        return "base";
    }


}
