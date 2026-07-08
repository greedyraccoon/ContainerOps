package com.containerops.customer.controller;

import com.containerops.customer.dto.CustomerRequestDto;
import com.containerops.customer.dto.CustomerResponseDto;
import com.containerops.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<CustomerResponseDto> createCustomer(@Valid @RequestBody CustomerRequestDto requestDto) {
        return new ResponseEntity<>(customerService.createCustomer(requestDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDto> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }


    @GetMapping("/active")
    public ResponseEntity<List<CustomerResponseDto>> getAllActiveCustomers() {
        return ResponseEntity.ok(customerService.getAllActiveCustomers());
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponseDto>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDto> updateCustomerDetails(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequestDto requestDto) {
        return ResponseEntity.ok(customerService.updateCustomerDetails(id, requestDto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> toggleCustomerStatus(
            @PathVariable Long id,
            @RequestParam boolean isActive) {
        customerService.toggleCustomerStatus(id, isActive);
        return ResponseEntity.noContent().build();
    }
}