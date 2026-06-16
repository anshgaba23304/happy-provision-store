package com.happyprovision.store.dto;

public class PushSubscribeRequest {
    private String endpoint;
    private Keys keys;
    private String role;
    private String phone;
    private String adminPin;

    public static class Keys {
        private String p256dh;
        private String auth;

        public String getP256dh() { return p256dh; }
        public void setP256dh(String p256dh) { this.p256dh = p256dh; }

        public String getAuth() { return auth; }
        public void setAuth(String auth) { this.auth = auth; }
    }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public Keys getKeys() { return keys; }
    public void setKeys(Keys keys) { this.keys = keys; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAdminPin() { return adminPin; }
    public void setAdminPin(String adminPin) { this.adminPin = adminPin; }
}
