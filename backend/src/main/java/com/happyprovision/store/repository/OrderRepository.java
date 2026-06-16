package com.happyprovision.store.repository;

import com.happyprovision.store.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByCustomerPhoneEndingWithOrderByCreatedAtDesc(String phoneSuffix);
}
