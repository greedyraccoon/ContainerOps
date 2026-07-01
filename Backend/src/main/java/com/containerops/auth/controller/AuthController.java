package com.containerops.auth.controller;

import com.containerops.auth.dto.request.LoginRequestDto;
import com.containerops.auth.dto.request.RegisterRequestDto;
import com.containerops.auth.dto.response.AuthResponseDto;
import com.containerops.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(
            @Valid @RequestBody RegisterRequestDto request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> authenticate(
            @Valid @RequestBody LoginRequestDto request
    ) {
        return ResponseEntity.ok(authService.authenticate(request));
    }
}