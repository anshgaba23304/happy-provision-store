package com.happyprovision.store.service;

import com.happyprovision.store.config.StoreProperties;
import com.happyprovision.store.dto.DeliveryCheckResponse;
import com.happyprovision.store.dto.OrderResponse;
import com.happyprovision.store.dto.StoreInfoResponse;
import com.happyprovision.store.model.Order;
import com.happyprovision.store.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final StoreProperties storeProperties;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final String adminPin;

    public OrderService(
            OrderRepository orderRepository,
            StoreProperties storeProperties,
            FileStorageService fileStorageService,
            NotificationService notificationService,
            @Value("${app.admin-pin}") String adminPin) {
        this.orderRepository = orderRepository;
        this.storeProperties = storeProperties;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
        this.adminPin = adminPin;
    }

    public StoreInfoResponse getStoreInfo() {
        StoreInfoResponse info = new StoreInfoResponse();
        info.setName(storeProperties.getName());
        info.setAddress(storeProperties.getAddress());
        info.setEmail(storeProperties.getEmail());
        info.setPhones(storeProperties.getPhoneList());
        info.setLat(storeProperties.getLat());
        info.setLng(storeProperties.getLng());
        info.setFreeDeliveryMinAmount(storeProperties.getFreeDeliveryMinAmount());
        info.setFreeDeliveryMaxKm(storeProperties.getFreeDeliveryMaxKm());
        return info;
    }

    public OrderResponse createOrder(
            String customerName,
            String customerPhone,
            String address,
            String estimatedAmount,
            String lat,
            String lng,
            String orderType,
            List<MultipartFile> images) throws IOException {

        if (customerName == null || customerName.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (customerPhone == null || customerPhone.isBlank()) {
            throw new IllegalArgumentException("Phone is required");
        }
        if (images == null || images.isEmpty()) {
            throw new IllegalArgumentException("At least one grocery image is required");
        }

        String type = (orderType == null || orderType.isBlank()) ? "pickup" : orderType.trim().toLowerCase();
        if (!type.equals("pickup") && !type.equals("delivery")) {
            type = "pickup";
        }

        if ("delivery".equals(type)) {
            if (address == null || address.isBlank()) {
                throw new IllegalArgumentException("Delivery address is required for home delivery");
            }
        }

        double amount = parseAmount(estimatedAmount);
        boolean freeDelivery = "delivery".equals(type)
                && amount >= storeProperties.getFreeDeliveryMinAmount();

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : images) {
            imageUrls.add(fileStorageService.store(file));
        }

        Order order = new Order();
        order.setId(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCustomerName(customerName.trim());
        order.setCustomerPhone(customerPhone.trim());
        order.setAddress(address != null ? address.trim() : "");
        order.setEstimatedAmount(amount);
        order.setDistanceKm(null);
        order.setFreeDelivery(freeDelivery);
        order.setOrderType(type);
        order.setImages(imageUrls);
        order.setStatus("pending");
        order.setCreatedAt(Instant.now());

        if ("pickup".equals(type) && (order.getAddress() == null || order.getAddress().isBlank())) {
            order.setAddress(storeProperties.getAddress());
        }

        Order saved = orderRepository.save(order);
        OrderResponse response = toResponse(saved);
        notificationService.notifyNewOrder(response);
        return response;
    }

    public List<OrderResponse> getAllOrders(String pin) {
        validateAdminPin(pin);
        return orderRepository.findAll().stream()
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    public List<OrderResponse> getOrdersByPhone(String phone) {
        String normalized = normalizePhone(phone);
        return orderRepository.findByCustomerPhoneEndingWithOrderByCreatedAtDesc(normalized)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return toResponse(order);
    }

    public OrderResponse markDelivered(String id, String pin) {
        validateAdminPin(pin);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!"delivered".equals(order.getStatus())) {
            order.setStatus("delivered");
            order.setDeliveredAt(Instant.now());
            order = orderRepository.save(order);
        }

        OrderResponse response = toResponse(order);
        notificationService.notifyOrderDelivered(response);
        return response;
    }

    public DeliveryCheckResponse checkDelivery(Double lat, Double lng, Double amount) {
        if (lat == null || lng == null) {
            return new DeliveryCheckResponse(false, null, "Location required");
        }

        double distanceKm = haversineKm(storeProperties.getLat(), storeProperties.getLng(), lat, lng);
        double amt = amount != null ? amount : 0;
        boolean eligible = amt >= storeProperties.getFreeDeliveryMinAmount()
                && distanceKm <= storeProperties.getFreeDeliveryMaxKm();

        String message;
        if (eligible) {
            message = "You qualify for FREE home delivery!";
        } else if (distanceKm > storeProperties.getFreeDeliveryMaxKm()) {
            message = String.format(
                    "Sorry, you're %.1f km away. Free delivery is only within %.0f km.",
                    distanceKm, storeProperties.getFreeDeliveryMaxKm());
        } else {
            message = String.format(
                    "Add Rs %.0f more for free delivery (min Rs %.0f).",
                    storeProperties.getFreeDeliveryMinAmount() - amt,
                    storeProperties.getFreeDeliveryMinAmount());
        }

        return new DeliveryCheckResponse(eligible, round(distanceKm, 2), message);
    }

    private void validateAdminPin(String pin) {
        if (pin == null || !adminPin.equals(pin.trim())) {
            throw new SecurityException("Invalid admin PIN");
        }
    }

    private String normalizePhone(String phone) {
        String digits = phone.replaceAll("\\D", "");
        return digits.length() >= 10 ? digits.substring(digits.length() - 10) : digits;
    }

    private double parseAmount(String value) {
        if (value == null || value.isBlank()) return 0;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private double round(double value, int places) {
        double scale = Math.pow(10, places);
        return Math.round(value * scale) / scale;
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerPhone(order.getCustomerPhone());
        response.setAddress(order.getAddress());
        response.setEstimatedAmount(order.getEstimatedAmount());
        response.setDistanceKm(order.getDistanceKm());
        response.setFreeDelivery(order.isFreeDelivery());
        response.setImages(order.getImages());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setDeliveredAt(order.getDeliveredAt());
        response.setOrderType(order.getOrderType() != null ? order.getOrderType() : "pickup");
        return response;
    }
}
