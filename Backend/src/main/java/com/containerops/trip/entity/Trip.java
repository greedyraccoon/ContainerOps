package com.containerops.trip.entity;

import com.containerops.container.entity.Container;
import com.containerops.driver.entity.Driver;
import com.containerops.trip.enums.TripStatus;
import com.containerops.vehicle.entity.Vehicle;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tripManifestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(nullable = false)
    private String sourceLocation;

    @Column(nullable = false)
    private String destinationLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus status;

    private LocalDateTime dispatchedAt;
    private LocalDateTime estimatedDeliveryAt;
    private LocalDateTime actualDeliveryAt;

    @Column(precision = 10, scale = 2)
    private Double startingOdometer;

    @Column(precision = 10, scale = 2)
    private Double endingOdometer;
}