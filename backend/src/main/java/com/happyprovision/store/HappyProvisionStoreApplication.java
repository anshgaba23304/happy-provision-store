package com.happyprovision.store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.boot.context.properties.EnableConfigurationProperties(com.happyprovision.store.config.StoreProperties.class)
public class HappyProvisionStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(HappyProvisionStoreApplication.class, args);
    }
}
