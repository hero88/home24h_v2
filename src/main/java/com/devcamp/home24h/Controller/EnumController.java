package com.devcamp.home24h.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devcamp.home24h.model.EDirection;
import com.devcamp.home24h.model.ERequest;
import com.devcamp.home24h.model.ERole;
import com.devcamp.home24h.model.ESecretQuestion;
import com.devcamp.home24h.model.ESort;
import com.devcamp.home24h.model.EStatus;
import com.devcamp.home24h.model.EType;


@RestController
@CrossOrigin
public class EnumController {


    public static class EnumObject {
        private String name;
        private int code;
        
        public EnumObject(int code, String name) {
            this.code = code;
            this.name = name;
        }
        
        public int getCode() {
            return code;
        }

        public String getName() {
            return name;
        }
        
    }

    public static class EnumDTO {
        private String value;
        private String name;
        
        

        public EnumDTO(String value, String name) {
            this.value = value;
            this.name = name;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
        
        
    }
    


    @GetMapping("/enum/eType/get/all")
    public EnumObject[] getAllTypes() {
        EType[] eTypes = EType.values();
        EnumObject[] eTypeObjects = new EnumObject[eTypes.length];

        Locale locale = new Locale("vi", "VN");
        ResourceBundle messages = ResourceBundle.getBundle("messages", locale);
        
        for (int i = 0; i < eTypes.length; i++) {
            EType eType = eTypes[i];
            String eTypeName = messages.getString(eType.name());
            EnumObject eTypeObject = new EnumObject( eType.getCode(), eTypeName);
            eTypeObjects[i] = eTypeObject;
        }
        
        return eTypeObjects;
    }

    @GetMapping("/enum/eRequest/get/all")
    public EnumObject[] getAllRequest() {
        ERequest[] eRequests = ERequest.values();
        EnumObject[] eRequestObjects = new EnumObject[eRequests.length];

        Locale locale = new Locale("vi", "VN");
        ResourceBundle messages = ResourceBundle.getBundle("messages", locale);
        
        for (int i = 0; i < eRequests.length; i++) {
            ERequest eRequest = eRequests[i];
            String eRequestName = messages.getString(eRequest.name());
            EnumObject eRequestObject = new EnumObject( eRequest.getCode(), eRequestName);
            eRequestObjects[i] = eRequestObject;
        }
        
        return eRequestObjects;
    }

    @GetMapping("/enum/eDirection/get/all")
    public EnumObject[] getAllDirection() {
        EDirection  [] eDirections = EDirection.values();
        EnumObject[] eDirectionObjects = new EnumObject[eDirections.length];

        Locale locale = new Locale("vi", "VN");
        ResourceBundle messages = ResourceBundle.getBundle("messages", locale);
        
        for (int i = 0; i < eDirections.length; i++) {
            EDirection eDirection = eDirections[i];
            String eDirectionName = messages.getString(eDirection.name());
            EnumObject eRequestObject = new EnumObject( eDirection.getCode(), eDirectionName);
            eDirectionObjects[i] = eRequestObject;
        }
        
        return eDirectionObjects;
    }

    @GetMapping("/enum/eStatus/get/all")
    public EnumObject[] getAllStatus() {
        EStatus  [] eStatuses = EStatus.values();
        EnumObject[] eStatusObjects = new EnumObject[eStatuses.length];

        Locale locale = new Locale("vi", "VN");
        ResourceBundle messages = ResourceBundle.getBundle("messages", locale);
        
        for (int i = 0; i < eStatuses.length; i++) {
            EStatus esStatus = eStatuses[i];
            String eDirectionName = messages.getString(esStatus.name());
            EnumObject eRequestObject = new EnumObject( esStatus.getCode(), eDirectionName);
            eStatusObjects[i] = eRequestObject;
        }
        
        return eStatusObjects;
    }

    @GetMapping("/enum/eSecretQuestion/all")
    public List<EnumDTO> getAllSecretQuestion(){
        List<EnumDTO> EnumDTOs  = new ArrayList<>();
        ESecretQuestion[] secretQuestions  = ESecretQuestion.values();

        Locale locale = new Locale("vi", "VN");
        ResourceBundle messages = ResourceBundle.getBundle("messages", locale);

        for (ESecretQuestion eSecretQuestion : secretQuestions){
            String value = eSecretQuestion.name();
            String name = messages.getString(eSecretQuestion.name());
            EnumDTOs.add(new EnumDTO(value, name));
        }
        return EnumDTOs;
    }

    @GetMapping("/enum/eSort/all")
    public List<EnumDTO> getAllSort(){
        List<EnumDTO> EnumDTOs  = new ArrayList<>();
        ESort[] eSorts  = ESort.values();

        Locale locale = new Locale("vi", "VN");
        ResourceBundle messages = ResourceBundle.getBundle("messages", locale);

        for (ESort  eSort : eSorts){
            String value = eSort.name();
            String name = messages.getString(eSort.name());
            EnumDTOs.add(new EnumDTO(value, name));
        }
        return EnumDTOs;
    }

    @GetMapping("/enum/eRole/all")
    public List<EnumDTO> getAllRoles(){
        List<EnumDTO> EnumDTOs  = new ArrayList<>();
        ERole[] eRoles  = ERole.values();

        Locale locale = new Locale("vi", "VN");
        ResourceBundle messages = ResourceBundle.getBundle("messages", locale);

        for (ERole  eRole : eRoles){
            String value = eRole.name();
            String name = messages.getString(eRole.name());
            EnumDTOs.add(new EnumDTO(value, name));
        }
        return EnumDTOs;
    }


    
}
