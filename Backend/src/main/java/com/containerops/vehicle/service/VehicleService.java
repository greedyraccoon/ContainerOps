package com.containerops.vehicle.service;

import com.containerops.vehicle.dto.VehicleRequestDto;
import com.containerops.vehicle.dto.VehicleResponseDto; // Assuming you have a standard response DTO
import com.containerops.vehicle.enums.VehicleStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface VehicleService {
    VehicleResponseDto createVehicle(VehicleRequestDto dto);
    VehicleResponseDto getVehicleById(Long id);
    List<VehicleResponseDto> getAllVehicles();
    VehicleResponseDto updateVehicle(Long id, VehicleRequestDto dto); // PutMapping: Heavy correction
    VehicleResponseDto updateVehicleStatus(Long id, VehicleStatus status); // PatchMapping: Operational update
    void deleteVehicle(Long id);
}