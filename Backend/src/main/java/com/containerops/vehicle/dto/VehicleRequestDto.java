package com.containerops.vehicle.dto;

import com.containerops.vehicle.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VehicleRequestDto {

    @NotBlank(message = "License plate is required")
    @Pattern(regexp = "^[A-Z]{2}-\\d{2}-[A-Z]{1,2}-\\d{4}$", message = "Must follow standard RTO format (e.g., MH-46-AB-1234)")
    private String licensePlate;

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;


    private Double capacityTons;

    @NotNull(message = "Vehicle type is required")
    private VehicleType type;
}