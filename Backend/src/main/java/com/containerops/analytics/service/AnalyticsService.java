package com.containerops.analytics.service;

import com.containerops.analytics.dto.TripProfitabilityResponseDto;

public interface AnalyticsService {
    TripProfitabilityResponseDto getTripProfitability(Long tripId);
}