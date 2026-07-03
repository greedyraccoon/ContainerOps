package com.containerops.trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TripRequestDto {
    @NotNull(message = "Vehicle assignment is required")
    private Long vehicleId;

    @NotNull(message = "Container assignment is required")
    private Long containerId;

    @NotNull(message = "Driver assignment is required")
    private Long driverId;

    @NotBlank(message = "Source location cannot be blank")
    private String sourceLocation;

    @NotBlank(message = "Destination location cannot be blank")
    private String destinationLocation;

    @NotNull(message = "Estimated delivery time is required")
    private LocalDateTime estimatedDeliveryAt;

    @NotNull(message = "Starting odometer reading is required")
    private Double startingOdometer;
}