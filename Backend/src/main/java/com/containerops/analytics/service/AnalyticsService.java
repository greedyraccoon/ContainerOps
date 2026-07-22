package com.containerops.analytics.service;

import com.containerops.analytics.dto.TripProfitabilityResponseDto;

import java.util.List;

public interface AnalyticsService {
    TripProfitabilityResponseDto getTripProfitability(Long tripId);

    List<TripProfitabilityResponseDto> getAllTripProfitability();
}