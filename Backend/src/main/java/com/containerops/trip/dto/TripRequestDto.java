package com.containerops.trip.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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

    @JsonAlias({"origin", "source"})
    @NotBlank(message = "Source location cannot be blank")
    private String sourceLocation;

    @JsonAlias({"destination"})
    @NotBlank(message = "Destination location cannot be blank")
    private String destinationLocation;

    @JsonAlias({"eta", "estimatedDelivery"})
    @NotNull(message = "Estimated delivery time is required")
    private LocalDateTime estimatedDeliveryAt;

    @NotNull(message = "Starting odometer reading is required")
    private Double startingOdometer;


}