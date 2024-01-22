package com.devcamp.home24h.model;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum ERequest {
    ForBuy(1),
    ForRent(2);
   
    private static final Map<Integer,ERequest> lookup 
         = new HashMap<Integer,ERequest>();
   
    static {
         for(ERequest s : EnumSet.allOf(ERequest.class))
              lookup.put(s.getCode(), s);
    }
   
    private int code;
   
    private ERequest(int code) {
         this.code = code;
    }   
   
    public int getCode() { return code; }
   
    public static ERequest getStatus(int code) { 
         return lookup.get(code); 
    }

    
}
