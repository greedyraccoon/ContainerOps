package com.containerops.vehicle.service;

import com.containerops.vehicle.dto.VehicleRequestDto;
import com.containerops.vehicle.dto.VehicleResponseDto;
import com.containerops.vehicle.entity.Vehicle;
import com.containerops.vehicle.enums.VehicleStatus;
import com.containerops.vehicle.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    @Transactional
    public VehicleResponseDto createVehicle(VehicleRequestDto dto) {
        Vehicle vehicle = Vehicle.builder()
                .licensePlate(dto.getLicensePlate())
                .make(dto.getMake())
                .model(dto.getModel())
                .type(dto.getType())
                .capacityTons(dto.getCapacityTons())
                .status(VehicleStatus.AVAILABLE) // Will fallback via @PrePersist too, but good to explicit set
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return mapToResponseDto(savedVehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponseDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));
        return mapToResponseDto(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponseDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    // Heavy Correction: Maps all structural descriptive attributes
    public VehicleResponseDto updateVehicle(Long id, VehicleRequestDto dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));

        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setMake(dto.getMake());
        vehicle.setModel(dto.getModel());
        vehicle.setType(dto.getType());
        vehicle.setCapacityTons(dto.getCapacityTons());

        return mapToResponseDto(vehicleRepository.save(vehicle));
    }

    @Override
    @Transactional
    // Operational field update
    public VehicleResponseDto updateVehicleStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));

        vehicle.setStatus(status);
        return mapToResponseDto(vehicleRepository.save(vehicle));
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));
        vehicleRepository.delete(vehicle);
    }

    private VehicleResponseDto mapToResponseDto(Vehicle vehicle) {
        return VehicleResponseDto.builder()
                .id(vehicle.getId())
                .licensePlate(vehicle.getLicensePlate())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .type(vehicle.getType())
                .status(vehicle.getStatus())
                .capacityTons(vehicle.getCapacityTons())
                .build();
    }
}