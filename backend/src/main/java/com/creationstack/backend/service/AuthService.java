package com.creationstack.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.creationstack.backend.auth.JwtUtil;
import com.creationstack.backend.domain.user.Job;
import com.creationstack.backend.domain.user.RefreshToken;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.domain.user.User.UserRole;
import com.creationstack.backend.domain.user.UserDetail;
import com.creationstack.backend.dto.member.LoginRequest;
import com.creationstack.backend.dto.member.LoginResponse;
import com.creationstack.backend.dto.member.LogoutRequest;
import com.creationstack.backend.dto.member.LogoutResponse;
import com.creationstack.backend.dto.member.SignupRequest;
import com.creationstack.backend.dto.member.SignupResponse;
import com.creationstack.backend.dto.member.TokenRefreshRequest;
import com.creationstack.backend.dto.member.TokenRefreshResponse;
import com.creationstack.backend.repository.JobRepository;
import com.creationstack.backend.repository.RefreshTokenRepository;
import com.creationstack.backend.repository.UserDetailRepository;
import com.creationstack.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

        private final UserRepository userRepository;
        private final UserDetailRepository userDetailRepository;
        private final JobRepository jobRepository;
        private final RefreshTokenRepository refreshTokenRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;

        /**
         * 회원가입 처리 (일반 사용자 및 카카오 사용자 모두 지원)
         */
        public SignupResponse signup(SignupRequest request) {
                log.info("회원가입 시작: email={}, platform={}", request.getEmail(), request.getPlatform());

                // 이메일 중복 체크
                if (userDetailRepository.existsByEmail(request.getEmail())) {
                        return SignupResponse.builder()
                                        .success(false)
                                        .message("이미 사용 중인 이메일입니다.")
                                        .build();
                }

                // 닉네임 중복 체크
                if (userDetailRepository.existsByNickname(request.getNickname())) {
                        return SignupResponse.builder()
                                        .success(false)
                                        .message("이미 사용 중인 닉네임입니다.")
                                        .build();
                }

                // 크리에이터인 경우 직업 존재 여부 확인
                Job job = null;
                if (request.getRole() == UserRole.CREATOR) {
                        job = jobRepository.findById(request.getJobId())
                                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 직업입니다."));
                }

                // 플랫폼별 처리
                UserDetail.Platform platform = request.isKakaoUser()
                                ? UserDetail.Platform.KAKAO
                                : UserDetail.Platform.LOCAL;

                String encodedPassword = null;
                if (request.isLocalUser() && request.getPassword() != null) {
                        encodedPassword = passwordEncoder.encode(request.getPassword());
                }

                // 카카오 사용자 중복 체크
                if (request.isKakaoUser()) {
                        Optional<UserDetail> existingKakaoUser = userDetailRepository
                                        .findByPlatformAndPlatformId(UserDetail.Platform.KAKAO,
                                                        request.getPlatformId());
                        if (existingKakaoUser.isPresent()) {
                                return SignupResponse.builder()
                                                .success(false)
                                                .message("이미 가입된 카카오 계정입니다.")
                                                .build();
                        }
                }

                // User 엔티티 생성
                User user = User.builder()
                                .role(request.getRole())
                                .job(job)
                                .isActive(true)
                                .build();

                // UserDetail 엔티티 생성
                UserDetail userDetail = UserDetail.builder()
                                .user(user)
                                .username(request.getUsername())
                                .nickname(request.getNickname())
                                .bio(request.getBio())
                                .platform(platform)
                                .platformId(request.getPlatformId())
                                .email(request.getEmail())
                                .password(encodedPassword)
                                .build();

                user.setUserDetail(userDetail);

                // 데이터베이스 저장
                User savedUser = userRepository.save(user);

                // JWT 토큰 생성
                String accessToken = jwtUtil.generateAccessToken(
                                savedUser.getUserId(),
                                userDetail.getEmail(),
                                savedUser.getRole().name(),
                                userDetail.getNickname(),
                                userDetail.getPlatform().name());

                String refreshToken = jwtUtil.generateRefreshToken(savedUser.getUserId());

                // Refresh Token 저장
                saveRefreshToken(savedUser.getUserId(), refreshToken);

                log.info("회원가입 성공: userId={}, email={}", savedUser.getUserId(), userDetail.getEmail());

                // 응답 생성
                return SignupResponse.builder()
                                .success(true)
                                .message("회원가입이 완료되었습니다.")
                                .data(SignupResponse.UserData.builder()
                                                .user(SignupResponse.UserInfo.builder()
                                                                .userId(savedUser.getUserId())
                                                                .username(userDetail.getUsername())
                                                                .nickname(userDetail.getNickname())
                                                                .email(userDetail.getEmail())
                                                                .role(savedUser.getRole())
                                                                .jobId(job != null ? job.getJobId() : null)
                                                                .jobName(job != null ? job.getName() : null)
                                                                .bio(userDetail.getBio())
                                                                .isActive(savedUser.getIsActive())
                                                                .createdAt(savedUser.getCreatedAt())
                                                                .build())
                                                .tokens(SignupResponse.TokenInfo.builder()
                                                                .accessToken(accessToken)
                                                                .refreshToken(refreshToken)
                                                                .tokenType("Bearer")
                                                                .expiresIn(jwtUtil.getAccessTokenExpirationInSeconds())
                                                                .build())
                                                .build())
                                .redirect("/")
                                .build();
        }

        /**
         * 로그인 처리 (일반 사용자만, 카카오 사용자는 OAuth로 처리)
         */
        public LoginResponse login(LoginRequest request) {
                log.info("로그인 시작: {}", request.getEmail());

                try {
                        // 1. 이메일로 UserDetail 조회
                        Optional<UserDetail> userDetailOpt = userDetailRepository.findByEmail(request.getEmail());
                        if (userDetailOpt.isEmpty()) {
                                log.warn("이메일로 사용자 찾기 실패: {}", request.getEmail());
                                return LoginResponse.builder()
                                                .success(false)
                                                .message("이메일 또는 비밀번호가 올바르지 않습니다.")
                                                .build();
                        }

                        UserDetail userDetail = userDetailOpt.get();
                        log.info("UserDetail 조회 성공: userId={}, platform={}",
                                        userDetail.getUserId(), userDetail.getPlatform());

                        // 2. 카카오 사용자인 경우 일반 로그인 차단
                        if (userDetail.getPlatform() == UserDetail.Platform.KAKAO) {
                                log.warn("카카오 사용자가 일반 로그인 시도: {}", request.getEmail());
                                return LoginResponse.builder()
                                                .success(false)
                                                .message("카카오 계정으로 가입된 사용자입니다. 카카오 로그인을 이용해주세요.")
                                                .build();
                        }

                        // 3. User 조회
                        Optional<User> userOpt = userRepository.findById(userDetail.getUserId());
                        if (userOpt.isEmpty()) {
                                log.warn("User 조회 실패: userId={}", userDetail.getUserId());
                                return LoginResponse.builder()
                                                .success(false)
                                                .message("이메일 또는 비밀번호가 올바르지 않습니다.")
                                                .build();
                        }

                        User user = userOpt.get();
                        log.info("User 조회 성공: userId={}, role={}", user.getUserId(), user.getRole());

                        // 4. 계정 활성화 확인
                        if (!user.getIsActive()) {
                                log.warn("비활성화된 계정: {}", request.getEmail());
                                return LoginResponse.builder()
                                                .success(false)
                                                .message("비활성화된 계정입니다.")
                                                .build();
                        }

                        // 5. 비밀번호 검증 (LOCAL 사용자만)
                        if (userDetail.getPlatform() == UserDetail.Platform.LOCAL) {
                                if (userDetail.getPassword() == null ||
                                                !passwordEncoder.matches(request.getPassword(),
                                                                userDetail.getPassword())) {
                                        log.warn("비밀번호 불일치: {}", request.getEmail());
                                        return LoginResponse.builder()
                                                        .success(false)
                                                        .message("이메일 또는 비밀번호가 올바르지 않습니다.")
                                                        .build();
                                }

                        }

                        log.info("로그인 인증 성공: {}", request.getEmail());

                        // 6. JWT 토큰 생성
                        String accessToken = jwtUtil.generateAccessToken(
                                        user.getUserId(),
                                        userDetail.getEmail(),
                                        user.getRole().name(),
                                        userDetail.getNickname(),
                                        userDetail.getPlatform().name());

                        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

                        // 7. 리프레시 토큰 저장
                        saveRefreshToken(user.getUserId(), refreshToken);

                        // 8. 성공 응답 생성
                        return LoginResponse.builder()
                                        .success(true)
                                        .message("로그인이 완료되었습니다.")
                                        .data(LoginResponse.UserData.builder()
                                                        .user(LoginResponse.UserInfo.builder()
                                                                        .userId(user.getUserId())
                                                                        .username(userDetail.getUsername())
                                                                        .nickname(userDetail.getNickname())
                                                                        .email(userDetail.getEmail())
                                                                        .role(user.getRole())
                                                                        .jobId(user.getJob() != null
                                                                                        ? user.getJob().getJobId()
                                                                                        : null)
                                                                        .jobName(user.getJob() != null
                                                                                        ? user.getJob().getName()
                                                                                        : null)
                                                                        .bio(userDetail.getBio())
                                                                        .profileImageUrl(
                                                                                        userDetail.getProfileImageUrl())
                                                                        .isActive(user.getIsActive())
                                                                        .createdAt(user.getCreatedAt())
                                                                        .lastLoginAt(LocalDateTime.now())
                                                                        .build())
                                                        .tokens(LoginResponse.TokenInfo.builder()
                                                                        .accessToken(accessToken)
                                                                        .refreshToken(refreshToken)
                                                                        .tokenType("Bearer")
                                                                        .expiresIn(jwtUtil
                                                                                        .getAccessTokenExpirationInSeconds())
                                                                        .build())
                                                        .build())
                                        .build();

                } catch (Exception e) {
                        log.error("로그인 처리 중 오류 발생: {}", e.getMessage(), e);
                        return LoginResponse.builder()
                                        .success(false)
                                        .message("로그인 처리 중 오류가 발생했습니다.")
                                        .build();
                }
        }

        /**
         * 토큰 갱신
         */
        public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
                String refreshToken = request.getRefreshToken();

                // Refresh Token 유효성 검증
                if (!jwtUtil.validateRefreshToken(refreshToken)) {
                        return TokenRefreshResponse.builder()
                                        .success(false)
                                        .message("유효하지 않은 리프레시 토큰입니다.")
                                        .build();
                }

                // 데이터베이스에서 토큰 확인
                Optional<RefreshToken> tokenEntity = refreshTokenRepository
                                .findByTokenAndIsRevokedFalse(refreshToken);

                if (tokenEntity.isEmpty() || tokenEntity.get().getExpiresAt().isBefore(LocalDateTime.now())) {
                        return TokenRefreshResponse.builder()
                                        .success(false)
                                        .message("만료되었거나 유효하지 않은 리프레시 토큰입니다.")
                                        .build();
                }

                Long userId = jwtUtil.getUserIdFromRefreshToken(refreshToken);

                // 사용자 정보 조회
                User user = userRepository.findByUserIdAndIsActiveTrue(userId)
                                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 사용자입니다."));

                // 새 Access Token 생성
                String newAccessToken = jwtUtil.generateAccessToken(
                                user.getUserId(),
                                user.getUserDetail().getEmail(),
                                user.getRole().name(),
                                user.getUserDetail().getNickname(),
                                user.getUserDetail().getPlatform().name());

                return TokenRefreshResponse.builder()
                                .success(true)
                                .data(TokenRefreshResponse.TokenData.builder()
                                                .accessToken(newAccessToken)
                                                .tokenType("Bearer")
                                                .expiresIn(jwtUtil.getAccessTokenExpirationInSeconds())
                                                .build())
                                .build();
        }

        /**
         * 로그아웃 - Refresh Token 무효화
         */
        public LogoutResponse logout(LogoutRequest request) {
                try {
                        String refreshToken = request.getRefreshToken();

                        // 1. Refresh Token 유효성 검증
                        if (!jwtUtil.validateRefreshToken(refreshToken)) {
                                log.warn("유효하지 않은 리프레시 토큰으로 로그아웃 시도");
                                return LogoutResponse.error("유효하지 않은 토큰입니다.");
                        }

                        // 2. 토큰에서 사용자 ID 추출
                        Long userId = jwtUtil.getUserIdFromRefreshToken(refreshToken);
                        log.info("로그아웃 요청 - userId: {}", userId);

                        // 3. 해당 사용자의 모든 Refresh Token 무효화
                        int revokedCount = refreshTokenRepository.revokeAllByUserId(userId);
                        log.info("사용자 {}의 {}개 토큰이 무효화됨", userId, revokedCount);

                        if (revokedCount == 0) {
                                log.warn("무효화할 토큰이 없음 - 이미 로그아웃된 상태일 수 있음");
                        }

                        return LogoutResponse.success();

                } catch (Exception e) {
                        log.error("로그아웃 처리 중 오류 발생: {}", e.getMessage(), e);
                        return LogoutResponse.error("로그아웃 처리 중 오류가 발생했습니다.");
                }
        }

        /**
         * Access Token을 통한 로그아웃
         */
        public LogoutResponse logoutWithAccessToken(String accessToken) {
                try {
                        // 1. Access Token 유효성 검증
                        if (!jwtUtil.validateAccessToken(accessToken)) {
                                log.warn("유효하지 않은 액세스 토큰으로 로그아웃 시도");
                                return LogoutResponse.error("유효하지 않은 토큰입니다.");
                        }

                        // 2. 토큰에서 사용자 ID 추출
                        Long userId = jwtUtil.getUserIdFromAccessToken(accessToken);
                        String email = jwtUtil.getEmailFromToken(accessToken);
                        log.info("로그아웃 요청 - userId: {}, email: {}", userId, email);

                        // 3. 해당 사용자의 모든 Refresh Token 무효화
                        int revokedCount = refreshTokenRepository.revokeAllByUserId(userId);
                        log.info("사용자 {}의 {}개 토큰이 무효화됨", userId, revokedCount);

                        return LogoutResponse.success();

                } catch (Exception e) {
                        log.error("로그아웃 처리 중 오류 발생: {}", e.getMessage(), e);
                        return LogoutResponse.error("로그아웃 처리 중 오류가 발생했습니다.");
                }

        }

        /**
         * Refresh Token 저장
         */
        public void saveRefreshToken(Long userId, String token) {
                // 기존 토큰들 무효화
                refreshTokenRepository.revokeAllByUserId(userId);

                // 새 토큰 저장
                RefreshToken refreshTokenEntity = RefreshToken.builder()
                                .token(token)
                                .userId(userId)
                                .expiresAt(LocalDateTime.now()
                                                .plusSeconds(jwtUtil.getRefreshTokenExpirationInSeconds()))
                                .createdAt(LocalDateTime.now())
                                .isRevoked(false)
                                .build();

                refreshTokenRepository.save(refreshTokenEntity);
        }

        /**
         * 이메일 사용 가능 여부 확인
         */
        public boolean isEmailAvailable(String email) {
                return !userDetailRepository.existsByEmail(email);
        }

        /**
         * 닉네임 사용 가능 여부 확인
         */
        public boolean isNicknameAvailable(String nickname) {
                return !userDetailRepository.existsByNickname(nickname);
        }
}
