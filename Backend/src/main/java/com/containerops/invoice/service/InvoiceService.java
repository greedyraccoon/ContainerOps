package com.containerops.invoice.service;

import com.containerops.invoice.dto.InvoiceRequestDto;
import com.containerops.invoice.dto.InvoiceResponseDto;
import com.containerops.invoice.enums.InvoiceStatus;

import java.util.List;

public interface InvoiceService {
    InvoiceResponseDto generateInvoice(InvoiceRequestDto requestDto);
    InvoiceResponseDto getInvoiceById(Long id);
    List<InvoiceResponseDto> getInvoicesByCustomerId(Long customerId);
    InvoiceResponseDto updateInvoiceDetails(Long id, InvoiceRequestDto requestDto);
    InvoiceResponseDto updateInvoiceStatus(Long id, InvoiceStatus status);
}