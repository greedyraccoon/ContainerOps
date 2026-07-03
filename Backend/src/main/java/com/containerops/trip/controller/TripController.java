package com.containerops.trip.controller;

import com.containerops.trip.dto.TripRequestDto;
import com.containerops.trip.dto.TripResponseDto;
import com.containerops.trip.enums.TripStatus;
import com.containerops.trip.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripResponseDto> planTrip(@Valid @RequestBody TripRequestDto requestDto) {
        return new ResponseEntity<>(tripService.planTrip(requestDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponseDto> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @GetMapping
    public ResponseEntity<List<TripResponseDto>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponseDto> updateTripDetails(
            @PathVariable Long id,
            @Valid @RequestBody TripRequestDto requestDto) {
        return ResponseEntity.ok(tripService.updateTripDetails(id, requestDto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TripResponseDto> updateTripStatus(
            @PathVariable Long id,
            @RequestParam TripStatus status,
            @RequestParam(required = false) Double currentOdometer) {
        return ResponseEntity.ok(tripService.updateTripStatus(id, status, currentOdometer));
    }
}