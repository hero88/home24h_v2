package com.devcamp.home24h.Repository;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devcamp.home24h.model.Realestate;
import com.devcamp.home24h.model.User;

public interface RealestateRepository extends JpaRepository<Realestate, Integer>{

    Realestate findByTitle(String title);

    //Cập nhật trạng thái Realestates
    @Transactional
    @Modifying
    @Query(value = "UPDATE realestate SET status = :paramStatus WHERE id  = :paramId", nativeQuery = true)
    	int updateStatus(@Param("paramStatus") int paramStatus, @Param("paramId") int paramId);

    List<Realestate> findByUser(User user);


    
}
