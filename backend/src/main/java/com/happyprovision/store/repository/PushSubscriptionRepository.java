package com.happyprovision.store.repository;

import com.happyprovision.store.model.PushSubscriptionDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends MongoRepository<PushSubscriptionDoc, String> {
    Optional<PushSubscriptionDoc> findByEndpoint(String endpoint);
    List<PushSubscriptionDoc> findByRole(String role);
    List<PushSubscriptionDoc> findByRoleAndPhone(String role, String phone);
    void deleteByEndpoint(String endpoint);
}
