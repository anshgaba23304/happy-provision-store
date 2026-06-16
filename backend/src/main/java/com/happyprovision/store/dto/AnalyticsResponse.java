package com.happyprovision.store.dto;

import java.util.ArrayList;
import java.util.List;

public class AnalyticsResponse {

    private long totalOrders;
    private long pendingOrders;
    private long deliveredOrders;
    private long todayOrders;
    private long pickupOrders;
    private long deliveryOrders;
    private double totalRevenue;
    private double todayRevenue;
    private double monthRevenue;
    private double averageOrderValue;
    private double deliveryPercentage;
    private List<DailySalesDto> dailySales = new ArrayList<>();
    private List<DailySalesDto> monthlySales = new ArrayList<>();

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }

    public long getTodayOrders() { return todayOrders; }
    public void setTodayOrders(long todayOrders) { this.todayOrders = todayOrders; }

    public long getPickupOrders() { return pickupOrders; }
    public void setPickupOrders(long pickupOrders) { this.pickupOrders = pickupOrders; }

    public long getDeliveryOrders() { return deliveryOrders; }
    public void setDeliveryOrders(long deliveryOrders) { this.deliveryOrders = deliveryOrders; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(double todayRevenue) { this.todayRevenue = todayRevenue; }

    public double getMonthRevenue() { return monthRevenue; }
    public void setMonthRevenue(double monthRevenue) { this.monthRevenue = monthRevenue; }

    public double getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(double averageOrderValue) { this.averageOrderValue = averageOrderValue; }

    public double getDeliveryPercentage() { return deliveryPercentage; }
    public void setDeliveryPercentage(double deliveryPercentage) { this.deliveryPercentage = deliveryPercentage; }

    public List<DailySalesDto> getDailySales() { return dailySales; }
    public void setDailySales(List<DailySalesDto> dailySales) { this.dailySales = dailySales; }

    public List<DailySalesDto> getMonthlySales() { return monthlySales; }
    public void setMonthlySales(List<DailySalesDto> monthlySales) { this.monthlySales = monthlySales; }
}
