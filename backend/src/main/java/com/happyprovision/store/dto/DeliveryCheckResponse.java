package com.happyprovision.store.dto;

public class DeliveryCheckResponse {
    private boolean eligible;
    private Double distanceKm;
    private String message;

    public DeliveryCheckResponse() {}

    public DeliveryCheckResponse(boolean eligible, Double distanceKm, String message) {
        this.eligible = eligible;
        this.distanceKm = distanceKm;
        this.message = message;
    }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
