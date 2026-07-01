package com.containerops.driver.repository;

import com.containerops.driver.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
        boolean existsByLicenseNumber(String licenseNumber);
        boolean existsByPhoneNumber(String phoneNumber);

        // Useful for fetching a driver specifically by their license
        Optional<Driver> findByLicenseNumber(String licenseNumber);
    }
