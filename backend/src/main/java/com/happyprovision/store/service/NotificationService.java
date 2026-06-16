package com.happyprovision.store.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.happyprovision.store.dto.OrderResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper;

    public NotificationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));
        return emitter;
    }

    public void notifyNewOrder(OrderResponse order) {
        broadcast("new-order", order);
    }

    public void notifyOrderDelivered(OrderResponse order) {
        broadcast("order-delivered", order);
    }

    private void broadcast(String event, OrderResponse order) {
        for (SseEmitter emitter : emitters) {
            try {
                String data = objectMapper.writeValueAsString(Map.of("event", event, "order", order));
                emitter.send(SseEmitter.event().name(event).data(data));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}
