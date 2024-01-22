package com.devcamp.home24h.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

import javax.annotation.PostConstruct;



@Configuration
public class FirebaseConfig {

    
    @PostConstruct
    public static void initFirebase() {
        try {
            InputStream serviceAccount = new ClassPathResource("home24h-firebase.json").getInputStream();
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setStorageBucket("home24h-9cf0a.appspot.com")
                .build();


            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
