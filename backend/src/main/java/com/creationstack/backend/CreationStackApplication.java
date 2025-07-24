package com.creationstack.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class CreationStackApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.directory(".")
				.ignoreIfMalformed()
				.ignoreIfMissing()
				.load();

		System.setProperty("portone.apisecret", dotenv.get("PORTONE_API_SECRET"));
		System.setProperty("portone.hostname", dotenv.get("PORTONE_HOSTNAME"));

		SpringApplication.run(CreationStackApplication.class, args);
	
	}

}