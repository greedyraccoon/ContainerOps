package com.containerops.container.dto.request;

import com.containerops.container.enums.ContainerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ContainerRequestDto {

    @NotBlank(message = "Container number is required")
    @Pattern(regexp = "^[A-Z]{4}\\d{7}$", message = "Must be a standard format (e.g., MSCU1234567)")
    private String containerNumber;

    @NotNull(message = "Container type is required")
    private ContainerType type;
}