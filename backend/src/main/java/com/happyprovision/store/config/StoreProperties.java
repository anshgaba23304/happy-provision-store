package com.happyprovision.store.config;

import com.happyprovision.store.dto.StoreContactDto;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.store")
public class StoreProperties {

    private String name;
    private String address;
    private String email;
    private String phones;
    private String contacts;
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

    public String getPhones() { return phones; }
    public void setPhones(String phones) { this.phones = phones; }

    public String getContacts() { return contacts; }
    public void setContacts(String contacts) { this.contacts = contacts; }

    public List<String> getPhoneList() {
        if (contacts != null && !contacts.isBlank()) {
            return getContactList().stream().map(StoreContactDto::getPhone).toList();
        }
        return Arrays.stream(phones.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(this::normalizePhone)
                .toList();
    }

    public List<StoreContactDto> getContactList() {
        String source = (contacts != null && !contacts.isBlank()) ? contacts : phones;
        return Arrays.stream(source.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(entry -> {
                    String[] parts = entry.split(":", 2);
                    StoreContactDto contact = new StoreContactDto();
                    contact.setPhone(normalizePhone(parts[0]));
                    contact.setName(parts.length > 1 ? parts[1].trim() : "");
                    return contact;
                })
                .toList();
    }

    private String normalizePhone(String value) {
        String digits = value.replaceAll("\\D", "");
        return digits.length() >= 10 ? digits.substring(digits.length() - 10) : digits;
    }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public double getFreeDeliveryMinAmount() { return freeDeliveryMinAmount; }
    public void setFreeDeliveryMinAmount(double freeDeliveryMinAmount) { this.freeDeliveryMinAmount = freeDeliveryMinAmount; }

    public double getFreeDeliveryMaxKm() { return freeDeliveryMaxKm; }
    public void setFreeDeliveryMaxKm(double freeDeliveryMaxKm) { this.freeDeliveryMaxKm = freeDeliveryMaxKm; }
}
