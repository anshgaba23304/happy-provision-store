package com.happyprovision.store.dto;

import java.util.List;

public class StoreInfoResponse {

    private String name;
    private String address;
    private String email;
    private List<String> phones;
    private double lat;
    private double lng;
    private double freeDeliveryMinAmount;
    private double freeDeliveryMaxKm;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getPhones() { return phones; }
    public void setPhones(List<String> phones) { this.phones = phones; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public double getFreeDeliveryMinAmount() { return freeDeliveryMinAmount; }
    public void setFreeDeliveryMinAmount(double freeDeliveryMinAmount) { this.freeDeliveryMinAmount = freeDeliveryMinAmount; }

    public double getFreeDeliveryMaxKm() { return freeDeliveryMaxKm; }
    public void setFreeDeliveryMaxKm(double freeDeliveryMaxKm) { this.freeDeliveryMaxKm = freeDeliveryMaxKm; }
}
