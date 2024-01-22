package com.devcamp.home24h.Controller;

import java.io.ByteArrayInputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devcamp.home24h.Service.StorageFirebaseService;

import org.springframework.http.MediaType;


@RestController
@CrossOrigin
@RequestMapping("/images")
public class ImageFirebaseController {

    @Autowired
    StorageFirebaseService storageFirebaseService;

    @GetMapping("/{imageName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String imageName) {
        byte[] imageData = storageFirebaseService.downloadImage(imageName);

        if (imageData != null) {
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.IMAGE_JPEG) // Hoặc MediaType.IMAGE_PNG tùy thuộc vào định dạng ảnh
                    .body(new InputStreamResource(new ByteArrayInputStream(imageData)));
        } else {
            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
    
    @GetMapping("/{folder}/{imageName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String folder, @PathVariable String imageName) {
        byte[] imageData = storageFirebaseService.downloadImage(folder, imageName);

        if (imageData != null) {
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.IMAGE_JPEG) // Hoặc MediaType.IMAGE_PNG tùy thuộc vào định dạng ảnh
                    .body(new InputStreamResource(new ByteArrayInputStream(imageData)));
        } else {
            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
    
}

