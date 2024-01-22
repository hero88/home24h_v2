package com.devcamp.home24h.model;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum EDirection {
    North(1),
    South(2),
    East(3),
    West(4),
    NorthEast(5), 
    SouthEast(6),
    NorthWest(7),
    SouthWest(8);

   
    private static final Map<Integer,EDirection> lookup 
         = new HashMap<Integer,EDirection>();
   
    static {
         for(EDirection s : EnumSet.allOf(EDirection.class))
              lookup.put(s.getCode(), s);
    }
   
    private int code;
   
    private EDirection(int code) {
         this.code = code;
    }   
   
    public int getCode() { return code; }
   
    public static EDirection getStatus(int code) { 
         return lookup.get(code); 
    }

}