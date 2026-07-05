package com.containerops.shipment.controller;

import com.containerops.shipment.dto.ShipmentRequestDto;
import com.containerops.shipment.dto.ShipmentResponseDto;
import com.containerops.shipment.entity.Shipment;
import com.containerops.shipment.enums.ShipmentStatus;
import com.containerops.shipment.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<ShipmentResponseDto> createShipment(@Valid @RequestBody ShipmentRequestDto requestDto) {
        return new ResponseEntity<>(shipmentService.createShipment(requestDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments() {
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponseDto> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ShipmentResponseDto>> getShipmentsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(shipmentService.getShipmentsByCustomerId(customerId));
    }

    @PatchMapping("/{id}/assign-trip")
    public ResponseEntity<ShipmentResponseDto> assignShipmentToTrip(
            @PathVariable Long id,
            @RequestParam Long tripId) {
        return ResponseEntity.ok(shipmentService.assignShipmentToTrip(id, tripId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ShipmentResponseDto> updateShipmentStatus(
            @PathVariable Long id,
            @RequestParam ShipmentStatus status) {
        return ResponseEntity.ok(shipmentService.updateShipmentStatus(id, status));
    }
}