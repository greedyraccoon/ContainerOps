package com.containerops.expense.service;

import com.containerops.expense.dto.ExpenseRequestDto;
import com.containerops.expense.dto.ExpenseResponseDto;
import com.containerops.expense.enums.ExpenseStatus;
import org.springframework.stereotype.Service;

import java.util.List;


public interface ExpenseService {
    ExpenseResponseDto logExpense(ExpenseRequestDto requestDto);
    ExpenseResponseDto getExpenseById(Long id);
    List<ExpenseResponseDto> getExpensesByTripId(Long tripId);
    ExpenseResponseDto updateExpenseDetails(Long id, ExpenseRequestDto requestDto);
    ExpenseResponseDto updateExpenseStatus(Long id, ExpenseStatus status);
    List<ExpenseResponseDto> getAllExpenses();
    void deleteExpense(Long id);
}