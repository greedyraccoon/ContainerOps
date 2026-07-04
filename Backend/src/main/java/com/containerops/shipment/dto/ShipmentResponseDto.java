package com.containerops.shipment.dto;

import com.containerops.shipment.enums.ShipmentDirection;
import com.containerops.shipment.enums.ShipmentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShipmentResponseDto {
    private Long id;
    private String shipmentNumber;
    private Long customerId;
    private String customerName;
    private Long containerId;
    private String containerNumber;
    private String shippingLine;
    private String blNumber;
    private ShipmentDirection direction;
    private String origin;
    private String destination;
    private LocalDateTime etd;
    private LocalDateTime eta;
    private ShipmentStatus status;
    private Long linkedTripId;
}