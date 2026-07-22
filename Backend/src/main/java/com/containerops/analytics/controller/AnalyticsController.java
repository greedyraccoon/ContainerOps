package com.containerops.analytics.controller;

import com.containerops.analytics.dto.TripProfitabilityResponseDto;
import com.containerops.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/trips/{tripId}/profit")
    public ResponseEntity<TripProfitabilityResponseDto> getTripProfitability(@PathVariable Long tripId) {
        return ResponseEntity.ok(analyticsService.getTripProfitability(tripId));
    }

    @GetMapping("/trip-profitability")
    public ResponseEntity<List<TripProfitabilityResponseDto>> getAllTripProfitability() {
        return ResponseEntity.ok(analyticsService.getAllTripProfitability());
    }
}