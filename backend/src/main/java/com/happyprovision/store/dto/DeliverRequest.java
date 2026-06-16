package com.happyprovision.store.dto;

public class DeliverRequest {
    private String adminPin;
    private Double billAmount;

    public String getAdminPin() { return adminPin; }
    public void setAdminPin(String adminPin) { this.adminPin = adminPin; }

    public Double getBillAmount() { return billAmount; }
    public void setBillAmount(Double billAmount) { this.billAmount = billAmount; }
}
