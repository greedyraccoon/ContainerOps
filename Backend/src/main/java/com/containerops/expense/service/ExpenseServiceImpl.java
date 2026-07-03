package com.containerops.expense.service;

import com.containerops.expense.dto.ExpenseRequestDto;
import com.containerops.expense.dto.ExpenseResponseDto;
import com.containerops.expense.entity.Expense;
import com.containerops.expense.enums.ExpenseStatus;
import com.containerops.expense.repository.ExpenseRepository;
import com.containerops.trip.entity.Trip;
import com.containerops.trip.repository.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.List;
import java.util.stream.Collectors;

@Service //  THIS is where the annotation belongs!
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;

    @Override
    @Transactional
    public ExpenseResponseDto logExpense(ExpenseRequestDto requestDto) {
        Trip trip = tripRepository.findById(requestDto.getTripId())
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with ID: " + requestDto.getTripId()));

        Expense expense = Expense.builder()
                .trip(trip)
                .expenseType(requestDto.getExpenseType())
                .amount(requestDto.getAmount())
                .expenseDate(requestDto.getExpenseDate())
                .description(requestDto.getDescription())
                .receiptUrl(requestDto.getReceiptUrl())
                .status(ExpenseStatus.PENDING)
                .build();

        return mapToResponseDto(expenseRepository.save(expense));
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponseDto getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found with ID: " + id));
        return mapToResponseDto(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponseDto> getExpensesByTripId(Long tripId) {
        return expenseRepository.findByTripId(tripId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExpenseResponseDto updateExpenseDetails(Long id, ExpenseRequestDto requestDto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found with ID: " + id));

        // Clean rule enforcement using Assert
        Assert.isTrue(expense.getStatus() == ExpenseStatus.PENDING,
                "Cannot modify expense details once it has been processed.");

        expense.setAmount(requestDto.getAmount());
        expense.setExpenseDate(requestDto.getExpenseDate());
        expense.setDescription(requestDto.getDescription());
        expense.setReceiptUrl(requestDto.getReceiptUrl());

        return mapToResponseDto(expenseRepository.save(expense));
    }

    @Override
    @Transactional
    public ExpenseResponseDto updateExpenseStatus(Long id, ExpenseStatus status) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found with ID: " + id));

        expense.setStatus(status);
        return mapToResponseDto(expenseRepository.save(expense));
    }

    private ExpenseResponseDto mapToResponseDto(Expense expense) {
        ExpenseResponseDto dto = new ExpenseResponseDto();
        dto.setId(expense.getId());
        dto.setTripId(expense.getTrip().getId());
        dto.setExpenseType(expense.getExpenseType());
        dto.setAmount(expense.getAmount());
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setDescription(expense.getDescription());
        dto.setReceiptUrl(expense.getReceiptUrl());
        dto.setStatus(expense.getStatus());
        return dto;
    }
}