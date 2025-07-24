package com.creationstack.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // 정적 리소스는 기본 설정에 맡기거나 필요시 추가
  }

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    // SPA fallback: 모든 / (api 제외) 요청은 index.html로 포워딩
    registry.addViewController("/{path:[^\\.]*}").setViewName("forward:/index.html");
    registry.addViewController("/**/{path:[^\\.]*}").setViewName("forward:/index.html");
  }
}