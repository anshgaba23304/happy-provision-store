package com.happyprovision.store.dto;

public class DeliveryCheckRequest {
    private Double lat;
    private Double lng;
    private Double amount;

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}
