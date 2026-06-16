package com.happyprovision.store.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {"/", "/order", "/track", "/admin"})
    public String forwardAppRoutes() {
        return "forward:/index.html";
    }
}
