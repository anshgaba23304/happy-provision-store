package com.happyprovision.store.controller;

import com.happyprovision.store.dto.ErrorResponse;
import com.happyprovision.store.dto.PushSubscribeRequest;
import com.happyprovision.store.service.PushNotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push")
public class PushController {

    private final PushNotificationService pushNotificationService;

    public PushController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    @GetMapping("/vapid-public-key")
    public ResponseEntity<?> getPublicKey() {
        if (!pushNotificationService.isEnabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("Push notifications not configured"));
        }
        return ResponseEntity.ok(Map.of("publicKey", pushNotificationService.getPublicKey()));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody PushSubscribeRequest request) {
        try {
            pushNotificationService.subscribe(request);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/subscribe")
    public ResponseEntity<?> unsubscribe(@RequestParam String endpoint) {
        pushNotificationService.unsubscribe(endpoint);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
