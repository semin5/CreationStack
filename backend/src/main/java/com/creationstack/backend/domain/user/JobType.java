package com.creationstack.backend.domain.user;

import lombok.Getter;

@Getter
public enum JobType {
    FRONTEND_DEVELOPER("프론트엔드 개발자"),
    BACKEND_DEVELOPER("백엔드 개발자"),
    FULLSTACK_DEVELOPER("풀스택 개발자"),
    MOBILE_DEVELOPER("앱 개발자 (iOS/Android)"),
    GAME_DEVELOPER("게임 개발자"),
    AI_ML_ENGINEER("AI/ML 엔지니어"),
    DEVOPS_ENGINEER("데브옵스 엔지니어"),
    DATA_ENGINEER("데이터 엔지니어"),
    SECURITY_ENGINEER("보안 엔지니어"),
    UX_UI_DESIGNER("UX/UI 디자이너"),
    SERVICE_PLANNER("서비스 기획자"),
    PRODUCT_MANAGER("프로덕트 매니저 (PM)"),
    BUSINESS_CONSULTANT("기업 컨설턴트"),
    BRAND_DESIGNER("BX/브랜드 디자이너"),
    HR_MANAGER("HR 담당자"),
    CAREER_CONSULTANT("커리어 컨설턴트"),
    SERVICE_OPERATOR("서비스 운영자"),
    MENTOR_COACH("멘토/코치"),
    IT_INSTRUCTOR("IT 교육 강사");

    private final String displayName;

    JobType(String displayName) {
        this.displayName = displayName;
    }

    // displayName으로 JobType 찾기
    public static JobType fromDisplayName(String displayName) {
        for (JobType jobType : JobType.values()) {
            if (jobType.displayName.equals(displayName)) {
                return jobType;
            }
        }
        throw new IllegalArgumentException("Unknown job type: " + displayName);
    }

    // 모든 직업명 리스트 반환
    public static String[] getAllDisplayNames() {
        JobType[] jobTypes = JobType.values();
        String[] displayNames = new String[jobTypes.length];
        for (int i = 0; i < jobTypes.length; i++) {
            displayNames[i] = jobTypes[i].displayName;
        }
        return displayNames;
    }
}