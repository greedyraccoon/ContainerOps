package com.containerops.shipment.entity;

import com.containerops.container.entity.Container;
import com.containerops.customer.entity.Customer;
import com.containerops.shipment.enums.ShipmentDirection;
import com.containerops.shipment.enums.ShipmentStatus;
import com.containerops.trip.entity.Trip;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String shipmentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;

    @Column(nullable = false)
    private String shippingLine;

    @Column(nullable = false, unique = true)
    private String blNumber; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentDirection direction;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    private LocalDateTime etd; // Estimated Time of Departure
    private LocalDateTime eta; // Estimated Time of Arrival

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_trip_id")
    private Trip linkedTrip;
}