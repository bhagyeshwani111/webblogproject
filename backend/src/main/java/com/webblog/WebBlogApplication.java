package com.webblog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.webblog.entity")
@EnableJpaRepositories(basePackages = "com.webblog.repository")
public class WebBlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebBlogApplication.class, args);
    }
}

