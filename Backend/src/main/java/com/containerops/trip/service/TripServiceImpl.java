package com.containerops.trip.service;

import com.containerops.container.entity.Container;
import com.containerops.container.repository.ContainerRepository;
import com.containerops.driver.entity.Driver;
import com.containerops.driver.repository.DriverRepository;
import com.containerops.trip.dto.TripRequestDto;
import com.containerops.trip.dto.TripResponseDto;
import com.containerops.trip.entity.Trip;
import com.containerops.trip.enums.TripStatus;
import com.containerops.trip.repository.TripRepository;
import com.containerops.vehicle.entity.Vehicle;
import com.containerops.vehicle.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final ContainerRepository containerRepository;
    private final DriverRepository driverRepository;

    private final List<TripStatus> ACTIVE_TRIP_STATUSES = List.of(
            TripStatus.PLANNED, TripStatus.DISPATCHED, TripStatus.IN_TRANSIT, TripStatus.DELAYED
    );

    @Override
    @Transactional
    public TripResponseDto planTrip(TripRequestDto requestDto) {
        Vehicle vehicle = vehicleRepository.findById(requestDto.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + requestDto.getVehicleId()));

        Container container = containerRepository.findById(requestDto.getContainerId())
                .orElseThrow(() -> new EntityNotFoundException("Container not found with ID: " + requestDto.getContainerId()));

        Driver driver = driverRepository.findById(requestDto.getDriverId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + requestDto.getDriverId()));

        // Clean, extracted validation
        validateAssetsAreAvailable(vehicle.getId(), container.getId(), driver.getId());

        Trip trip = Trip.builder()
                .tripManifestNumber("TRP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .vehicle(vehicle)
                .container(container)
                .driver(driver)
                .sourceLocation(requestDto.getSourceLocation())
                .destinationLocation(requestDto.getDestinationLocation())
                .estimatedDeliveryAt(requestDto.getEstimatedDeliveryAt())
                .startingOdometer(requestDto.getStartingOdometer())
                .status(TripStatus.PLANNED)
                .build();

        return mapToResponseDto(tripRepository.save(trip));
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponseDto getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with ID: " + id));
        return mapToResponseDto(trip);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponseDto> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TripResponseDto updateTripDetails(Long id, TripRequestDto requestDto) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with ID: " + id));

        Assert.isTrue(trip.getStatus() == TripStatus.PLANNED,
                "Cannot modify structural trip details once dispatched. Use status updates instead.");

        trip.setSourceLocation(requestDto.getSourceLocation());
        trip.setDestinationLocation(requestDto.getDestinationLocation());
        trip.setEstimatedDeliveryAt(requestDto.getEstimatedDeliveryAt());
        trip.setStartingOdometer(requestDto.getStartingOdometer());

        return mapToResponseDto(tripRepository.save(trip));
    }

    @Override
    @Transactional
    public TripResponseDto updateTripStatus(Long id, TripStatus status, Double currentOdometer) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with ID: " + id));

        // Delegate state checks to a clean helper method
        processStateTransition(trip, status, currentOdometer);

        trip.setStatus(status);
        return mapToResponseDto(tripRepository.save(trip));
    }


// to vheck if vehicle is availabe
    private void validateAssetsAreAvailable(Long vehicleId, Long containerId, Long driverId) {
        Assert.isTrue(!tripRepository.existsByVehicleIdAndStatusIn(vehicleId, ACTIVE_TRIP_STATUSES),
                "Vehicle is currently assigned to an active trip.");
        Assert.isTrue(!tripRepository.existsByContainerIdAndStatusIn(containerId, ACTIVE_TRIP_STATUSES),
                "Container is currently assigned to an active trip.");
        Assert.isTrue(!tripRepository.existsByDriverIdAndStatusIn(driverId, ACTIVE_TRIP_STATUSES),
                "Driver is currently assigned to an active trip.");
    }

    private void processStateTransition(Trip trip, TripStatus newStatus, Double currentOdometer) {
        if (newStatus == TripStatus.DISPATCHED) {
            Assert.isTrue(trip.getStatus() == TripStatus.PLANNED, "Trip must be PLANNED before it can be DISPATCHED.");
            trip.setDispatchedAt(LocalDateTime.now());
        }
        else if (newStatus == TripStatus.COMPLETED) {
            Assert.isTrue(currentOdometer != null && currentOdometer > trip.getStartingOdometer(),
                    "A valid ending odometer reading is required to complete a trip.");
            trip.setEndingOdometer(currentOdometer);
            trip.setActualDeliveryAt(LocalDateTime.now());
        }
        else if (newStatus == TripStatus.CANCELLED) {
            Assert.isTrue(trip.getStatus() != TripStatus.COMPLETED, "Cannot cancel a completed trip.");
        }
    }

    private TripResponseDto mapToResponseDto(Trip trip) {
        TripResponseDto dto = new TripResponseDto();
        dto.setId(trip.getId());
        dto.setTripManifestNumber(trip.getTripManifestNumber());
        dto.setVehicleId(trip.getVehicle().getId());
        dto.setContainerId(trip.getContainer().getId());
        dto.setContainerNumber(trip.getContainer().getContainerNumber());
        dto.setDriverId(trip.getDriver().getId());
        dto.setSourceLocation(trip.getSourceLocation());
        dto.setDestinationLocation(trip.getDestinationLocation());
        dto.setStatus(trip.getStatus());
        dto.setDispatchedAt(trip.getDispatchedAt());
        dto.setEstimatedDeliveryAt(trip.getEstimatedDeliveryAt());
        dto.setActualDeliveryAt(trip.getActualDeliveryAt());
        dto.setStartingOdometer(trip.getStartingOdometer());
        dto.setEndingOdometer(trip.getEndingOdometer());
        return dto;
    }
}