package com.happyprovision.store.dto;

public class DailySalesDto {

    private String date;
    private long orders;
    private long delivered;
    private long pending;
    private double revenue;

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public long getOrders() { return orders; }
    public void setOrders(long orders) { this.orders = orders; }

    public long getDelivered() { return delivered; }
    public void setDelivered(long delivered) { this.delivered = delivered; }

    public long getPending() { return pending; }
    public void setPending(long pending) { this.pending = pending; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }
}
