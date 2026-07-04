package com.containerops.shipment.repository;

import com.containerops.shipment.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    List<Shipment> findByCustomerId(Long customerId);
    
    List<Shipment> findByContainerId(Long containerId);
    Optional<Shipment> findByShipmentNumber(String shipmentNumber);
    Optional<Shipment> findByBlNumber(String blNumber);
}