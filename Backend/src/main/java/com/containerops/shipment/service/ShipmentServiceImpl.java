package com.containerops.shipment.service;

import com.containerops.container.entity.Container;
import com.containerops.container.repository.ContainerRepository;
import com.containerops.customer.entity.Customer;
import com.containerops.customer.repository.CustomerRepository;
import com.containerops.shipment.dto.ShipmentRequestDto;
import com.containerops.shipment.dto.ShipmentResponseDto;
import com.containerops.shipment.entity.Shipment;
import com.containerops.shipment.enums.ShipmentStatus;
import com.containerops.shipment.repository.ShipmentRepository;
import com.containerops.trip.entity.Trip;
import com.containerops.trip.repository.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final CustomerRepository customerRepository;
    private final ContainerRepository containerRepository;
    private final TripRepository tripRepository;

    @Override
    @Transactional
    public ShipmentResponseDto createShipment(ShipmentRequestDto requestDto) {
        Customer customer = customerRepository.findById(requestDto.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + requestDto.getCustomerId()));

        Assert.isTrue(customer.isActive(), "Cannot create a shipment for an inactive customer account.");

        Container container = containerRepository.findById(requestDto.getContainerId())
                .orElseThrow(() -> new EntityNotFoundException("Container not found with ID: " + requestDto.getContainerId()));

        Shipment shipment = Shipment.builder()
                .shipmentNumber("SHP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .container(container)
                .shippingLine(requestDto.getShippingLine())
                .blNumber(requestDto.getBlNumber())
                .direction(requestDto.getDirection())
                .origin(requestDto.getOrigin())
                .destination(requestDto.getDestination())
                .etd(requestDto.getEtd())
                .eta(requestDto.getEta())
                .status(ShipmentStatus.BOOKED)
                .build();

        return mapToResponseDto(shipmentRepository.save(shipment));
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponseDto getShipmentById(Long id) {
        return mapToResponseDto(shipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with ID: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentResponseDto> getShipmentsByCustomerId(Long customerId) {
        return shipmentRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShipmentResponseDto assignShipmentToTrip(Long shipmentId, Long tripId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with ID: " + shipmentId));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with ID: " + tripId));

        // Ensure the trip is actually moving the container associated with this EXIM shipment
        Assert.isTrue(trip.getContainer().getId().equals(shipment.getContainer().getId()),
                "Mismatch: The assigned Trip is not carrying the Container registered to this Shipment.");

        shipment.setLinkedTrip(trip);
        shipment.setStatus(ShipmentStatus.INLAND_TRANSIT);
        return mapToResponseDto(shipmentRepository.save(shipment));
    }

    @Override
    @Transactional
    public ShipmentResponseDto updateShipmentStatus(Long id, ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with ID: " + id));

        shipment.setStatus(status);
        return mapToResponseDto(shipmentRepository.save(shipment));
    }

    @Transactional
    @Override
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }


    @Override
    @Transactional
    public ShipmentResponseDto updateShipment(Long id, ShipmentRequestDto requestDto) {
        // 1. Fetch existing shipment records or fail early
        Shipment existingShipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + id));

        // 2. Fetch required relational objects using their database IDs
        Customer customer = customerRepository.findById(requestDto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + requestDto.getCustomerId()));
        Container container = containerRepository.findById(requestDto.getContainerId())
                .orElseThrow(() -> new RuntimeException("Container not found with ID: " + requestDto.getContainerId()));

        // 3. Map new incoming request data over the entity managed records
        existingShipment.setCustomer(customer);
        existingShipment.setContainer(container);
        existingShipment.setShippingLine(requestDto.getShippingLine());
        existingShipment.setBlNumber(requestDto.getBlNumber());
        existingShipment.setDirection(requestDto.getDirection());
        existingShipment.setOrigin(requestDto.getOrigin());
        existingShipment.setDestination(requestDto.getDestination());
        existingShipment.setEtd(requestDto.getEtd());
        existingShipment.setEta(requestDto.getEta());

        // 4. Commit managed entity state back down into database
        Shipment savedShipment = shipmentRepository.save(existingShipment);

        // 5. Use your private mapping method to format the response payload
        return mapToResponseDto(savedShipment);
    }



    private ShipmentResponseDto mapToResponseDto(Shipment shipment) {
        ShipmentResponseDto dto = new ShipmentResponseDto();
        dto.setId(shipment.getId());
        dto.setShipmentNumber(shipment.getShipmentNumber());
        dto.setCustomerId(shipment.getCustomer().getId());
        dto.setCustomerName(shipment.getCustomer().getCompanyName());
        dto.setContainerId(shipment.getContainer().getId());
        dto.setContainerNumber(shipment.getContainer().getContainerNumber());
        dto.setShippingLine(shipment.getShippingLine());
        dto.setBlNumber(shipment.getBlNumber());
        dto.setDirection(shipment.getDirection());
        dto.setOrigin(shipment.getOrigin());
        dto.setDestination(shipment.getDestination());
        dto.setEtd(shipment.getEtd());
        dto.setEta(shipment.getEta());
        dto.setStatus(shipment.getStatus());

        if (shipment.getLinkedTrip() != null) {
            dto.setLinkedTripId(shipment.getLinkedTrip().getId());
        }
        return dto;
    }
}