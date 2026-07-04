package com.containerops.invoice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InvoiceRequestDto {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotNull(message = "Base freight charge is required")
    @DecimalMin(value = "1.0", message = "Charge must be strictly positive")
    private Double baseFreightCharge;

    @NotNull(message = "Tax amount is required")
    @DecimalMin(value = "0.0", message = "Tax cannot be negative")
    private Double taxAmount;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
}