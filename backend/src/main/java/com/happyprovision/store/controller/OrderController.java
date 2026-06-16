package com.happyprovision.store.controller;

import com.happyprovision.store.dto.*;
import com.happyprovision.store.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/store")
    public StoreInfoResponse getStore() {
        return orderService.getStoreInfo();
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(
            @RequestParam String customerName,
            @RequestParam String customerPhone,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String estimatedAmount,
            @RequestParam(required = false) String lat,
            @RequestParam(required = false) String lng,
            @RequestParam(defaultValue = "pickup") String orderType,
            @RequestParam("images") List<MultipartFile> images) {
        try {
            OrderResponse order = orderService.createOrder(
                    customerName, customerPhone, address, estimatedAmount, lat, lng, orderType, images);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to save images"));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String adminPin) {
        try {
            if (adminPin != null) {
                return ResponseEntity.ok(orderService.getAllOrders(adminPin));
            }
            if (phone != null) {
                return ResponseEntity.ok(orderService.getOrdersByPhone(phone));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Unauthorized"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PatchMapping("/orders/{id}/deliver")
    public ResponseEntity<?> deliverOrder(@PathVariable String id, @RequestBody DeliverRequest request) {
        try {
            return ResponseEntity.ok(orderService.markDelivered(id, request.getAdminPin()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/check-delivery")
    public DeliveryCheckResponse checkDelivery(@RequestBody DeliveryCheckRequest request) {
        return orderService.checkDelivery(request.getLat(), request.getLng(), request.getAmount());
    }
}
