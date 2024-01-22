package com.devcamp.home24h.Service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageFirebaseService {
    String uploadImage(MultipartFile file);

    byte[] downloadImage(String imageName);
    
    byte[] downloadImage(String folder, String imageName); 

    void deleteImage(String imageName);
    
} 
