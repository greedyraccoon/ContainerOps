package com.containerops.trip.dto;

import com.containerops.trip.enums.TripStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TripResponseDto {
    private Long id;
    private String tripManifestNumber;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Long containerId;
    private String containerNumber;
    private Long driverId;
    private String driverName;
    private String sourceLocation;
    private String destinationLocation;
    private TripStatus status;
    private LocalDateTime dispatchedAt;
    private LocalDateTime estimatedDeliveryAt;
    private LocalDateTime actualDeliveryAt;
    private Double startingOdometer;
    private Double endingOdometer;
}
