package com.containerops.customer.repository;

import com.containerops.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByGstNumber(String gstNumber);
    boolean existsByCompanyName(String companyName);
}