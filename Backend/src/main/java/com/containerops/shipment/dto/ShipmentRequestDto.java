package com.containerops.shipment.dto;

import com.containerops.shipment.enums.ShipmentDirection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShipmentRequestDto {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Container ID is required")
    private Long containerId;

    @NotBlank(message = "Shipping line is required")
    private String shippingLine;

    @NotBlank(message = "Bill of Lading (BL) number is required")
    private String blNumber;

    @NotNull(message = "Shipment direction (IMPORT/EXPORT) is required")
    private ShipmentDirection direction;

    @NotBlank(message = "Origin port/location is required")
    private String origin;

    @NotBlank(message = "Destination port/location is required")
    private String destination;

    @NotNull(message = "ETD is required")
    private LocalDateTime etd;

    @NotNull(message = "ETA is required")
    private LocalDateTime eta;
}