package com.containerops.invoice.dto;

import com.containerops.invoice.enums.InvoiceStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InvoiceResponseDto {
    private Long id;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private Long tripId;
    private Double baseFreightCharge;
    private Double taxAmount;
    private Double totalAmount;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private InvoiceStatus status;
}