package com.containerops.driver.dto.response;

import com.containerops.driver.enums.DriverStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DriverResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String licenseNumber;
    private String phoneNumber;
    private DriverStatus status;
    private LocalDateTime createdAt;
}