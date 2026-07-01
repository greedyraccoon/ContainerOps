package com.containerops.auth.service;

import com.containerops.auth.dto.request.LoginRequestDto;
import com.containerops.auth.dto.request.RegisterRequestDto;
import com.containerops.auth.dto.response.AuthResponseDto;

public interface AuthService {
    AuthResponseDto register(RegisterRequestDto request);
    AuthResponseDto authenticate(LoginRequestDto request);
}

