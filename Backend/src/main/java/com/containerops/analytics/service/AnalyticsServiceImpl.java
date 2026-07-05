package com.containerops.analytics.service;

import com.containerops.analytics.dto.TripProfitabilityResponseDto;
import com.containerops.expense.entity.Expense;
import com.containerops.expense.repository.ExpenseRepository;
import com.containerops.invoice.entity.Invoice;
import com.containerops.invoice.repository.InvoiceRepository;
import com.containerops.trip.entity.Trip;
import com.containerops.trip.repository.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional(readOnly = true)
    public TripProfitabilityResponseDto getTripProfitability(Long tripId) {
        // 1. Validate the Trip exists
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with ID: " + tripId));

        // 2. Calculate Total Expenses
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        double totalExpenses = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        // 3. Calculate Total Revenue (Handle case where invoice isn't generated yet)
        Optional<Invoice> invoiceOpt = invoiceRepository.findByTripId(tripId);
        double totalRevenue = invoiceOpt.map(Invoice::getTotalAmount).orElse(0.0);

        // 4. Calculate Margins
        double netProfit = totalRevenue - totalExpenses;

        double marginPercentage = 0.0;
        if (totalRevenue > 0) {
            marginPercentage = (netProfit / totalRevenue) * 100;
        }

        // 5. Build and return the payload
        TripProfitabilityResponseDto dto = new TripProfitabilityResponseDto();
        dto.setTripId(trip.getId());
        dto.setTripManifestNumber(trip.getTripManifestNumber());

        // Rounding to 2 decimal places for clean JSON output
        dto.setTotalRevenue(Math.round(totalRevenue * 100.0) / 100.0);
        dto.setTotalExpenses(Math.round(totalExpenses * 100.0) / 100.0);
        dto.setNetProfit(Math.round(netProfit * 100.0) / 100.0);
        dto.setMarginPercentage(Math.round(marginPercentage * 100.0) / 100.0);

        return dto;
    }
}