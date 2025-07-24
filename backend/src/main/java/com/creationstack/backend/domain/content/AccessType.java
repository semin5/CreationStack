package com.creationstack.backend.domain.content;

/**
 * 콘텐츠의 접근 타입을 정의하는 Enum입니다.
 * FREE: 전체 공개 콘텐츠
 * SUBSCRIBER: 구독자 전용 콘텐츠
 */
public enum AccessType {
    FREE,       // 전체 공개
    SUBSCRIBER  // 구독자 전용
}
