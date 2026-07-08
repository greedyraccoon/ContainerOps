package com.containerops.driver.service.implementation;
import com.containerops.driver.dto.request.DriverRequestDto;
import com.containerops.driver.dto.response.DriverResponseDto;
import com.containerops.driver.entity.Driver;
import com.containerops.driver.enums.DriverStatus;
import com.containerops.driver.repository.DriverRepository;
import com.containerops.driver.service.DriverService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;

    @Override
    @Transactional
    public DriverResponseDto createDriver(DriverRequestDto request) {
        // Business Rule: License numbers and phones must be unique
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new IllegalArgumentException("License number already registered");
        }
        if (driverRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already registered");
        }

        // Map DTO to Entity
        Driver driver = Driver.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .licenseNumber(request.getLicenseNumber())
                .phoneNumber(request.getPhoneNumber())
                .status(DriverStatus.AVAILABLE) // Default state
                .build();

        Driver savedDriver = driverRepository.save(driver);
        return mapToResponseDto(savedDriver);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponseDto> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DriverResponseDto getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with id: " + id));
        return mapToResponseDto(driver);
    }

    @Override
    @Transactional
    public DriverResponseDto updateDriverStatus(Long id, DriverStatus status) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with id: " + id));

        driver.setStatus(status);
        return mapToResponseDto(driverRepository.save(driver));
    }

    @Override
    @Transactional
    public DriverResponseDto updateDriver(Long id, DriverRequestDto request) {
        // 1. Find the existing driver or throw a 404
        Driver existingDriver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));

        // 2. Update the fields with the new data from the DTO
        existingDriver.setFirstName(request.getFirstName());
        existingDriver.setLastName(request.getLastName());
        existingDriver.setLicenseNumber(request.getLicenseNumber());
        existingDriver.setPhoneNumber(request.getPhoneNumber());

        // 3. Save the updated entity back to the database
        Driver updatedDriver = driverRepository.save(existingDriver);

        // 4. Map it back to a ResponseDto and return (Use your existing mapper logic here)
        return DriverResponseDto.builder()
                .id(updatedDriver.getId())
                .firstName(updatedDriver.getFirstName())
                .lastName(updatedDriver.getLastName())
                .licenseNumber(updatedDriver.getLicenseNumber())
                .phoneNumber(updatedDriver.getPhoneNumber())
                .status(updatedDriver.getStatus())
                .createdAt(updatedDriver.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteDriver(Long id) {
        Driver existingDriver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));
        driverRepository.delete(existingDriver);
    }

    // Helper method to keep mapping clean without needing an external library yet
    private DriverResponseDto mapToResponseDto(Driver driver) {
        return DriverResponseDto.builder()
                .id(driver.getId())
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .licenseNumber(driver.getLicenseNumber())
                .phoneNumber(driver.getPhoneNumber())
                .status(driver.getStatus())
                .createdAt(driver.getCreatedAt())
                .build();
    }
}