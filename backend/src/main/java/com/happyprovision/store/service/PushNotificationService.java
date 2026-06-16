package com.happyprovision.store.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.happyprovision.store.config.VapidProperties;
import com.happyprovision.store.dto.OrderResponse;
import com.happyprovision.store.dto.PushSubscribeRequest;
import com.happyprovision.store.model.PushSubscriptionDoc;
import com.happyprovision.store.repository.PushSubscriptionRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);

    private final PushSubscriptionRepository repository;
    private final VapidProperties vapidProperties;
    private final ObjectMapper objectMapper;
    private final String adminPin;
    private PushService pushService;

    public PushNotificationService(
            PushSubscriptionRepository repository,
            VapidProperties vapidProperties,
            ObjectMapper objectMapper,
            @Value("${app.admin-pin}") String adminPin) {
        this.repository = repository;
        this.vapidProperties = vapidProperties;
        this.objectMapper = objectMapper;
        this.adminPin = adminPin;
    }

    public String getPublicKey() {
        return vapidProperties.getPublicKey();
    }

    public boolean isEnabled() {
        return vapidProperties.isConfigured();
    }

    public void subscribe(PushSubscribeRequest request) {
        validateSubscribeRequest(request);

        if ("admin".equals(request.getRole())) {
            validateAdminPin(request.getAdminPin());
        } else if ("customer".equals(request.getRole())) {
            if (normalizePhone(request.getPhone()).length() < 10) {
                throw new IllegalArgumentException("Valid phone number required for customer notifications");
            }
        } else {
            throw new IllegalArgumentException("Invalid role");
        }

        PushSubscriptionDoc doc = repository.findByEndpoint(request.getEndpoint())
                .orElse(new PushSubscriptionDoc());
        doc.setEndpoint(request.getEndpoint());
        doc.setP256dh(request.getKeys().getP256dh());
        doc.setAuth(request.getKeys().getAuth());
        doc.setRole(request.getRole());
        doc.setPhone("customer".equals(request.getRole()) ? normalizePhone(request.getPhone()) : null);
        if (doc.getCreatedAt() == null) {
            doc.setCreatedAt(Instant.now());
        }
        repository.save(doc);
    }

    public void unsubscribe(String endpoint) {
        if (endpoint != null && !endpoint.isBlank()) {
            repository.deleteByEndpoint(endpoint);
        }
    }

    public void notifyAdminsNewOrder(OrderResponse order) {
        if (!isEnabled()) return;
        String body = String.format("Order #%s from %s · %s",
                order.getId(), order.getCustomerName(), order.getCustomerPhone());
        sendToRole("admin", "🔔 New Order!", body, "/admin", "admin-new-" + order.getId());
    }

    public void notifyCustomerOrderReady(OrderResponse order) {
        if (!isEnabled()) return;
        String phone = normalizePhone(order.getCustomerPhone());
        if (phone.length() < 10) return;

        boolean isDelivery = "delivery".equals(order.getOrderType());
        String title = isDelivery ? "🎉 Order Delivered!" : "✅ Order Ready for Pickup!";
        String body = isDelivery
                ? String.format("Your order #%s has been delivered. Thank you!", order.getId())
                : String.format("Order #%s is ready — pick up at Happy Provision Store.", order.getId());

        sendToCustomer(phone, title, body, "/track", "customer-ready-" + order.getId());
    }

    private void sendToRole(String role, String title, String body, String url, String tag) {
        List<PushSubscriptionDoc> subs = repository.findByRole(role);
        if (subs.isEmpty()) {
            log.info("No push subscriptions for role '{}' — user should tap Enable in app", role);
            return;
        }
        log.info("Sending push to {} {} subscriber(s)", subs.size(), role);
        for (PushSubscriptionDoc sub : subs) {
            sendOne(sub, title, body, url, tag);
        }
    }

    private void sendToCustomer(String phone, String title, String body, String url, String tag) {
        List<PushSubscriptionDoc> subs = repository.findByRoleAndPhone("customer", phone);
        if (subs.isEmpty()) {
            log.info("No push subscriptions for customer phone {} — enable on Track page", phone);
            return;
        }
        for (PushSubscriptionDoc sub : subs) {
            sendOne(sub, title, body, url, tag);
        }
    }

    private void sendOne(PushSubscriptionDoc sub, String title, String body, String url, String tag) {
        try {
            PushService service = getPushService();
            Subscription subscription = new Subscription(
                    sub.getEndpoint(),
                    new Subscription.Keys(sub.getP256dh(), sub.getAuth()));

            String payload = objectMapper.writeValueAsString(Map.of(
                    "title", title,
                    "body", body,
                    "url", url,
                    "tag", tag
            ));

            service.send(new Notification(subscription, payload));
            log.debug("Push sent to {}", sub.getEndpoint());
        } catch (Exception e) {
            log.warn("Push failed for {}: {}", sub.getEndpoint(), e.getMessage());
            if (e.getMessage() != null && (e.getMessage().contains("410") || e.getMessage().contains("404"))) {
                repository.deleteByEndpoint(sub.getEndpoint());
            }
        }
    }

    private PushService getPushService() throws Exception {
        if (pushService == null) {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            pushService = new PushService(
                    vapidProperties.getPublicKey(),
                    vapidProperties.getPrivateKey(),
                    vapidProperties.getSubject());
        }
        return pushService;
    }

    private void validateSubscribeRequest(PushSubscribeRequest request) {
        if (request.getEndpoint() == null || request.getEndpoint().isBlank()) {
            throw new IllegalArgumentException("Missing push endpoint");
        }
        if (request.getKeys() == null
                || request.getKeys().getP256dh() == null
                || request.getKeys().getAuth() == null) {
            throw new IllegalArgumentException("Missing push keys");
        }
    }

    private void validateAdminPin(String pin) {
        if (pin == null || !adminPin.equals(pin.trim())) {
            throw new SecurityException("Invalid admin PIN");
        }
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("\\D", "");
        return digits.length() >= 10 ? digits.substring(digits.length() - 10) : digits;
    }
}
