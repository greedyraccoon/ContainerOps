package com.containerops.customer.service;

import com.containerops.customer.dto.CustomerRequestDto;
import com.containerops.customer.dto.CustomerResponseDto;
import com.containerops.customer.entity.Customer;
import com.containerops.customer.repository.CustomerRepository;
import com.containerops.expense.dto.ExpenseResponseDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CustomerResponseDto createCustomer(CustomerRequestDto requestDto) {
        validateUniqueConstraints(requestDto, null);

        Customer customer = Customer.builder()
                .companyName(requestDto.getCompanyName())
                .contactPerson(requestDto.getContactPerson())
                .email(requestDto.getEmail())
                .phone(requestDto.getPhone())
                .gstNumber(requestDto.getGstNumber())
                .billingAddress(requestDto.getBillingAddress())
                .customerType(requestDto.getCustomerType())
                .isActive(true)
                .build();

        return mapToResponseDto(customerRepository.save(customer));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponseDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + id));
        return mapToResponseDto(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDto> getAllActiveCustomers() {
        return customerRepository.findAll().stream()
                .filter(Customer::isActive)
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CustomerResponseDto updateCustomerDetails(Long id, CustomerRequestDto requestDto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + id));

        validateUniqueConstraints(requestDto, id);

        customer.setCompanyName(requestDto.getCompanyName());
        customer.setContactPerson(requestDto.getContactPerson());
        customer.setEmail(requestDto.getEmail());
        customer.setPhone(requestDto.getPhone());
        customer.setGstNumber(requestDto.getGstNumber());
        customer.setBillingAddress(requestDto.getBillingAddress());
        customer.setCustomerType(requestDto.getCustomerType());

        return mapToResponseDto(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void toggleCustomerStatus(Long id, boolean isActive) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + id));
        customer.setActive(isActive);
        customerRepository.save(customer);
    }

    @Transactional
    @Override
    public List<CustomerResponseDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private void validateUniqueConstraints(CustomerRequestDto dto, Long currentCustomerId) {
        // If it's a new customer (ID is null) OR the email belongs to a different customer ID
        if (currentCustomerId == null || !customerRepository.findById(currentCustomerId).get().getEmail().equals(dto.getEmail())) {
            Assert.isTrue(!customerRepository.existsByEmail(dto.getEmail()), "Email is already registered.");
        }
        if (currentCustomerId == null || !customerRepository.findById(currentCustomerId).get().getPhone().equals(dto.getPhone())) {
            Assert.isTrue(!customerRepository.existsByPhone(dto.getPhone()), "Phone number is already registered.");
        }
        if (currentCustomerId == null || !customerRepository.findById(currentCustomerId).get().getGstNumber().equals(dto.getGstNumber())) {
            Assert.isTrue(!customerRepository.existsByGstNumber(dto.getGstNumber()), "GST Number is already registered.");
        }
        if (currentCustomerId == null || !customerRepository.findById(currentCustomerId).get().getCompanyName().equals(dto.getCompanyName())) {
            Assert.isTrue(!customerRepository.existsByCompanyName(dto.getCompanyName()), "Company Name is already registered.");
        }
    }

    private CustomerResponseDto mapToResponseDto(Customer customer) {
        CustomerResponseDto dto = new CustomerResponseDto();
        dto.setId(customer.getId());
        dto.setCompanyName(customer.getCompanyName());
        dto.setContactPerson(customer.getContactPerson());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setGstNumber(customer.getGstNumber());
        dto.setBillingAddress(customer.getBillingAddress());
        dto.setCustomerType(customer.getCustomerType());
        dto.setActive(customer.isActive());
        return dto;
    }
}

