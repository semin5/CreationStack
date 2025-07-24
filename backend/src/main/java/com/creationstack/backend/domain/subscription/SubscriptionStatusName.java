package com.creationstack.backend.domain.subscription;

public class SubscriptionStatusName {
    public static final String PENDING = "PENDING";
    public static final String ACTIVE = "ACTIVE";
    public static final String CANCELLED = "CANCELLED";
    public static final String EXPIRED = "EXPIRED";

    private SubscriptionStatusName() {
        throw new UnsupportedOperationException("상수 클래스는 인스턴스화할 수 없습니다.");
    }
}
