package com.creationstack.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.creationstack.backend.domain.user.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u JOIN FETCH u.userDetail ud WHERE ud.email = :email AND u.isActive = true")
    Optional<User> findByEmailAndIsActiveTrue(@Param("email") String email);

    @Query("SELECT u FROM User u JOIN FETCH u.userDetail ud WHERE u.userId = :userId AND u.isActive = true")
    Optional<User> findByUserIdAndIsActiveTrue(@Param("userId") Long userId);

    @Query("SELECT u FROM User u WHERE u.userDetail.nickname = :nickname")
    Optional<User> findByUserDetailNickname(@Param("nickname") String nickname);

    @Modifying
    @Query("UPDATE User u SET u.isActive = false, u.job = null WHERE u.id = :userId")
    void deactivateUser(@Param("userId") Long userId);

    boolean existsByUserDetail_Email(String email);

    boolean existsByUserDetail_Nickname(String nickname);
}
