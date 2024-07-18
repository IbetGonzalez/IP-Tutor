package com.IpTutor.Backend.controller;

import io.github.wimdeblauwe.htmx.spring.boot.mvc.HtmxRequest;
import io.github.wimdeblauwe.htmx.spring.boot.mvc.HxRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

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
        return name + "Content";
    }

//    @HxRequest
//    @RequestMapping("/games/tuninggame")
//    public String tuningGameHx(Model model) {
//        return "games/tuninggame";
//    }

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
        model.addAttribute("content", name + "Content");
        return "base";
    }
}
