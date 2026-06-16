package com.happyprovision.store.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/** Prevent browsers/PWA from serving stale HTML or service worker after deploy. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class NoCacheHtmlFilter extends OncePerRequestFilter {

    private static final Set<String> NO_CACHE_PATHS = Set.of(
            "/",
            "/index.html",
            "/order",
            "/track",
            "/admin",
            "/sw.js",
            "/registerSW.js",
            "/manifest.webmanifest"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if ("GET".equalsIgnoreCase(request.getMethod()) && NO_CACHE_PATHS.contains(request.getRequestURI())) {
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
        }
        chain.doFilter(request, response);
    }
}
