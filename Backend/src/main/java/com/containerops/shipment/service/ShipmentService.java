package com.containerops.shipment.service;

import com.containerops.shipment.dto.ShipmentRequestDto;
import com.containerops.shipment.dto.ShipmentResponseDto;
import com.containerops.shipment.enums.ShipmentStatus;

import java.util.List;

public interface ShipmentService {
    ShipmentResponseDto createShipment(ShipmentRequestDto requestDto);
    ShipmentResponseDto getShipmentById(Long id);
    List<ShipmentResponseDto> getShipmentsByCustomerId(Long customerId);
    ShipmentResponseDto assignShipmentToTrip(Long shipmentId, Long tripId);
    ShipmentResponseDto updateShipmentStatus(Long id, ShipmentStatus status);
}