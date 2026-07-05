package com.containerops.invoice.controller;

import com.containerops.invoice.dto.InvoiceRequestDto;
import com.containerops.invoice.dto.InvoiceResponseDto;
import com.containerops.invoice.entity.Invoice;
import com.containerops.invoice.enums.InvoiceStatus;
import com.containerops.invoice.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<InvoiceResponseDto> generateInvoice(@Valid @RequestBody InvoiceRequestDto requestDto) {
        return new ResponseEntity<>(invoiceService.generateInvoice(requestDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDto> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<InvoiceResponseDto>> getInvoicesByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByCustomerId(customerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponseDto> updateInvoiceDetails(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceRequestDto requestDto) {
        return ResponseEntity.ok(invoiceService.updateInvoiceDetails(id, requestDto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponseDto> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestParam InvoiceStatus status) {
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, status));
    }
}