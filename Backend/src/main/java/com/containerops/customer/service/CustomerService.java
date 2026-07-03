package com.containerops.customer.service;

import com.containerops.customer.dto.CustomerRequestDto;
import com.containerops.customer.dto.CustomerResponseDto;

import java.util.List;

public interface CustomerService {
    CustomerResponseDto createCustomer(CustomerRequestDto requestDto);
    CustomerResponseDto getCustomerById(Long id);
    List<CustomerResponseDto> getAllActiveCustomers();
    CustomerResponseDto updateCustomerDetails(Long id, CustomerRequestDto requestDto);
    void toggleCustomerStatus(Long id, boolean isActive);
}
