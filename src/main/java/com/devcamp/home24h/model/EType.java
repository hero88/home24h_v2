package com.devcamp.home24h.model;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum EType {
    HOUSE(1),
    APARTMENT(2),
    OFFICE(3),
    LAND(4);
   
    private static final Map<Integer,EType> lookup 
         = new HashMap<Integer,EType>();
   
    static {
         for(EType s : EnumSet.allOf(EType.class))
              lookup.put(s.getCode(), s);
    }
   
    private int code;

   
    private EType(int code) {
         this.code = code;
    }   
   
    public int getCode() { return code; }



   
    public static EType getStatus(int code) { 
         return lookup.get(code); 
    }
    

}