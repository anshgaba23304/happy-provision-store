package com.happyprovision.store.service;

import com.happyprovision.store.dto.AnalyticsResponse;
import com.happyprovision.store.dto.DailySalesDto;
import com.happyprovision.store.model.Order;
import com.happyprovision.store.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final OrderRepository orderRepository;
    private final String adminPin;

    public AnalyticsService(OrderRepository orderRepository, @Value("${app.admin-pin}") String adminPin) {
        this.orderRepository = orderRepository;
        this.adminPin = adminPin;
    }

    public AnalyticsResponse getAnalytics(String pin) {
        validateAdminPin(pin);
        List<Order> orders = orderRepository.findAll();
        LocalDate today = LocalDate.now(ZONE);
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());

        AnalyticsResponse response = new AnalyticsResponse();
        response.setTotalOrders(orders.size());
        response.setPendingOrders(orders.stream().filter(o -> "pending".equals(o.getStatus())).count());
        response.setDeliveredOrders(orders.stream().filter(o -> "delivered".equals(o.getStatus())).count());
        response.setPickupOrders(orders.stream().filter(o -> "pickup".equals(o.getOrderType())).count());
        response.setDeliveryOrders(orders.stream().filter(o -> "delivery".equals(o.getOrderType())).count());

        double totalRevenue = sumDeliveredRevenue(orders);
        response.setTotalRevenue(round(totalRevenue));
        response.setTodayRevenue(round(sumDeliveredRevenue(orders, today, today)));
        response.setMonthRevenue(round(sumDeliveredRevenue(orders, monthStart, today)));
        response.setTodayOrders(orders.stream().filter(o -> isOnDate(o.getCreatedAt(), today)).count());
        response.setAverageOrderValue(
                response.getDeliveredOrders() > 0
                        ? round(totalRevenue / response.getDeliveredOrders())
                        : 0
        );
        response.setDeliveryPercentage(
                response.getTotalOrders() > 0
                        ? round((response.getDeliveryOrders() * 100.0) / response.getTotalOrders())
                        : 0
        );

        response.setDailySales(buildDailySales(orders, today.minusDays(29), today));
        response.setMonthlySales(buildMonthlySales(orders, today.minusMonths(11).withDayOfMonth(1), today));
        return response;
    }

    private List<DailySalesDto> buildDailySales(List<Order> orders, LocalDate from, LocalDate to) {
        Map<String, DailySalesDto> byDay = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            DailySalesDto day = new DailySalesDto();
            day.setDate(d.format(DAY_FMT));
            byDay.put(day.getDate(), day);
        }

        for (Order order : orders) {
            if (order.getCreatedAt() == null) continue;
            LocalDate created = order.getCreatedAt().atZone(ZONE).toLocalDate();
            if (created.isBefore(from) || created.isAfter(to)) continue;

            String key = created.format(DAY_FMT);
            DailySalesDto day = byDay.get(key);
            if (day == null) continue;

            day.setOrders(day.getOrders() + 1);
            if ("delivered".equals(order.getStatus())) {
                day.setDelivered(day.getDelivered() + 1);
                day.setRevenue(round(day.getRevenue() + order.getEstimatedAmount()));
            } else {
                day.setPending(day.getPending() + 1);
            }
        }

        return byDay.values().stream()
                .sorted(Comparator.comparing(DailySalesDto::getDate))
                .collect(Collectors.toList());
    }

    private List<DailySalesDto> buildMonthlySales(List<Order> orders, LocalDate from, LocalDate to) {
        Map<String, DailySalesDto> byMonth = new LinkedHashMap<>();
        LocalDate cursor = from.withDayOfMonth(1);
        LocalDate end = to.withDayOfMonth(1);
        while (!cursor.isAfter(end)) {
            DailySalesDto month = new DailySalesDto();
            month.setDate(cursor.format(MONTH_FMT));
            byMonth.put(month.getDate(), month);
            cursor = cursor.plusMonths(1);
        }

        for (Order order : orders) {
            if (order.getCreatedAt() == null) continue;
            LocalDate created = order.getCreatedAt().atZone(ZONE).toLocalDate();
            if (created.isBefore(from) || created.isAfter(to)) continue;

            String key = created.withDayOfMonth(1).format(MONTH_FMT);
            DailySalesDto month = byMonth.get(key);
            if (month == null) continue;

            month.setOrders(month.getOrders() + 1);
            if ("delivered".equals(order.getStatus())) {
                month.setDelivered(month.getDelivered() + 1);
                month.setRevenue(round(month.getRevenue() + order.getEstimatedAmount()));
            } else {
                month.setPending(month.getPending() + 1);
            }
        }

        return byMonth.values().stream()
                .sorted(Comparator.comparing(DailySalesDto::getDate))
                .collect(Collectors.toList());
    }

    private double sumDeliveredRevenue(List<Order> orders) {
        return orders.stream()
                .filter(o -> "delivered".equals(o.getStatus()))
                .mapToDouble(Order::getEstimatedAmount)
                .sum();
    }

    private double sumDeliveredRevenue(List<Order> orders, LocalDate from, LocalDate to) {
        return orders.stream()
                .filter(o -> "delivered".equals(o.getStatus()))
                .filter(o -> o.getDeliveredAt() != null)
                .filter(o -> {
                    LocalDate d = o.getDeliveredAt().atZone(ZONE).toLocalDate();
                    return !d.isBefore(from) && !d.isAfter(to);
                })
                .mapToDouble(Order::getEstimatedAmount)
                .sum();
    }

    private boolean isOnDate(Instant instant, LocalDate date) {
        if (instant == null) return false;
        return instant.atZone(ZONE).toLocalDate().equals(date);
    }

    private void validateAdminPin(String pin) {
        if (pin == null || !adminPin.equals(pin.trim())) {
            throw new SecurityException("Invalid admin PIN");
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
