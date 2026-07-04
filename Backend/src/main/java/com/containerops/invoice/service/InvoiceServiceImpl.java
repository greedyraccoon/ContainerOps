package com.containerops.invoice.service;

import com.containerops.customer.entity.Customer;
import com.containerops.customer.repository.CustomerRepository;
import com.containerops.invoice.dto.InvoiceRequestDto;
import com.containerops.invoice.dto.InvoiceResponseDto;
import com.containerops.invoice.entity.Invoice;
import com.containerops.invoice.enums.InvoiceStatus;
import com.containerops.invoice.repository.InvoiceRepository;
import com.containerops.trip.entity.Trip;
import com.containerops.trip.repository.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final TripRepository tripRepository;

    @Override
    @Transactional
    public InvoiceResponseDto generateInvoice(InvoiceRequestDto requestDto) {
        Customer customer = customerRepository.findById(requestDto.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + requestDto.getCustomerId()));

        Trip trip = tripRepository.findById(requestDto.getTripId())
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with ID: " + requestDto.getTripId()));

        Assert.isTrue(invoiceRepository.findByTripId(trip.getId()).isEmpty(),
                "An invoice has already been generated for this trip.");

        Invoice invoice = Invoice.builder()
                .invoiceNumber("INV-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase())
                .customer(customer)
                .trip(trip)
                .baseFreightCharge(requestDto.getBaseFreightCharge())
                .taxAmount(requestDto.getTaxAmount())
                .totalAmount(requestDto.getBaseFreightCharge() + requestDto.getTaxAmount())
                .issueDate(LocalDate.now())
                .dueDate(requestDto.getDueDate())
                .status(InvoiceStatus.DRAFT)
                .build();

        return mapToResponseDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponseDto getInvoiceById(Long id) {
        return mapToResponseDto(invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with ID: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponseDto> getInvoicesByCustomerId(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvoiceResponseDto updateInvoiceDetails(Long id, InvoiceRequestDto requestDto) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with ID: " + id));

        Assert.isTrue(invoice.getStatus() == InvoiceStatus.DRAFT,
                "Cannot modify financial details of an invoice once it has been issued.");

        invoice.setBaseFreightCharge(requestDto.getBaseFreightCharge());
        invoice.setTaxAmount(requestDto.getTaxAmount());
        invoice.setTotalAmount(requestDto.getBaseFreightCharge() + requestDto.getTaxAmount());
        invoice.setDueDate(requestDto.getDueDate());

        return mapToResponseDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceResponseDto updateInvoiceStatus(Long id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with ID: " + id));

        if (status == InvoiceStatus.ISSUED) {
            Assert.isTrue(invoice.getStatus() == InvoiceStatus.DRAFT, "Only DRAFT invoices can be ISSUED.");
        }

        invoice.setStatus(status);
        return mapToResponseDto(invoiceRepository.save(invoice));
    }

    private InvoiceResponseDto mapToResponseDto(Invoice invoice) {
        InvoiceResponseDto dto = new InvoiceResponseDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setCustomerId(invoice.getCustomer().getId());
        dto.setCustomerName(invoice.getCustomer().getCompanyName());
        dto.setTripId(invoice.getTrip().getId());
        dto.setBaseFreightCharge(invoice.getBaseFreightCharge());
        dto.setTaxAmount(invoice.getTaxAmount());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setIssueDate(invoice.getIssueDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setStatus(invoice.getStatus());
        return dto;
    }
}