package com.containerops.driver.service;

import com.containerops.driver.dto.request.DriverRequestDto;
import com.containerops.driver.dto.response.DriverResponseDto;
import com.containerops.driver.enums.DriverStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface DriverService {
    DriverResponseDto createDriver(DriverRequestDto request);
    List<DriverResponseDto> getAllDrivers();
    DriverResponseDto getDriverById(Long id);
    DriverResponseDto updateDriverStatus(Long id, DriverStatus status);
}