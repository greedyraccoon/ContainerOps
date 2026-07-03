package com.containerops.customer.dto;

import com.containerops.customer.enums.CustomerType;
import lombok.Data;

@Data
public class CustomerResponseDto {
    private Long id;
    private String companyName;
    private String contactPerson;
    private String email;
    private String phone;
    private String gstNumber;
    private String billingAddress;
    private CustomerType customerType;
    private boolean isActive;
}
