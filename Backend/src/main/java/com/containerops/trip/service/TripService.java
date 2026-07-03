package com.containerops.trip.service;

import com.containerops.trip.dto.TripRequestDto;
import com.containerops.trip.dto.TripResponseDto;
import com.containerops.trip.enums.TripStatus;

import java.util.List;

public interface TripService {
    TripResponseDto planTrip(TripRequestDto requestDto);
    TripResponseDto getTripById(Long id);
    List<TripResponseDto> getAllTrips();
    TripResponseDto updateTripDetails(Long id, TripRequestDto requestDto);
    TripResponseDto updateTripStatus(Long id, TripStatus status, Double currentOdometer);
}