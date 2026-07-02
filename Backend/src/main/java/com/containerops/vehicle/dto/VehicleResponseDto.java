package com.containerops.vehicle.dto;

import com.containerops.vehicle.enums.VehicleStatus;
import com.containerops.vehicle.enums.VehicleType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VehicleResponseDto {
    private Long id;
    private String licensePlate;
    private String make;
    private String model;
    private Double capacityTons;
    private VehicleType type;
    private VehicleStatus status;
    private LocalDateTime createdAt;
}