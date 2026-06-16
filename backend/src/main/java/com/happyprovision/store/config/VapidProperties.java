package com.happyprovision.store.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.vapid")
public class VapidProperties {
    private String publicKey = "";
    private String privateKey = "";
    private String subject = "mailto:gaba23304@gmail.com";

    public boolean isConfigured() {
        return publicKey != null && !publicKey.isBlank()
                && privateKey != null && !privateKey.isBlank();
    }

    public String getPublicKey() { return publicKey; }
    public void setPublicKey(String publicKey) { this.publicKey = publicKey; }

    public String getPrivateKey() { return privateKey; }
    public void setPrivateKey(String privateKey) { this.privateKey = privateKey; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}
