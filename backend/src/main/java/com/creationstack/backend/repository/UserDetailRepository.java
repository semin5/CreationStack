package com.creationstack.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.domain.user.UserDetail;
import com.creationstack.backend.domain.user.UserDetail.Platform;

@Repository
public interface UserDetailRepository extends JpaRepository<UserDetail, Long> {
    Optional<UserDetail> findByEmail(String email);

    Optional<UserDetail> findByNickname(String nickname);

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    Optional<UserDetail> findByPlatformAndPlatformId(Platform platform, String platformId);

    Optional<UserDetail> findByUser(User user);

    @Modifying
    @Query("UPDATE UserDetail ud SET ud.nickname = :nickname, ud.username = :username, ud.email = :email, " +
            "ud.bio = null, ud.profileImageUrl = null, ud.password = null, ud.platformId = null " +
            "WHERE ud.user.id = :userId")
    void anonymizeUserDetails(@Param("userId") Long userId, @Param("nickname") String nickname,
            @Param("username") String username, @Param("email") String email);

}
