package com.devcamp.home24h.model;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum EStatus {
    APPROVAL(1),
    PENDING_APPROVAL (2),
    PENDING_DELETE(3);

    private static final Map<Integer,EStatus> lookup 
         = new HashMap<Integer,EStatus>();
   
    static {
         for(EStatus s : EnumSet.allOf(EStatus.class))
              lookup.put(s.getCode(), s);
    }
   
    private int code;
   
    private EStatus(int code) {
         this.code = code;
    }   
   
    public int getCode() { return code; }
   
    public static EStatus getStatus(int code) { 
         return lookup.get(code); 
    }


}
