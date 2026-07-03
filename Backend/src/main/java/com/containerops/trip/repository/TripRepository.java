package com.containerops.trip.repository;

import com.containerops.trip.entity.Trip;
import com.containerops.trip.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    Optional<Trip> findByTripManifestNumber(String tripManifestNumber);

    // for prevententng double-booking active assets
    boolean existsByVehicleIdAndStatusIn(Long vehicleId, List<TripStatus> activeStatuses);
    boolean existsByDriverIdAndStatusIn(Long driverId, List<TripStatus> activeStatuses);
    boolean existsByContainerIdAndStatusIn(Long containerId, List<TripStatus> activeStatuses);
}