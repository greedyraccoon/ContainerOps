package com.containerops.expense.dto;

import com.containerops.expense.enums.ExpenseStatus;
import com.containerops.expense.enums.ExpenseType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExpenseResponseDto {
    private Long id;
    private Long tripId;
    private ExpenseType expenseType;
    private Double amount;
    private LocalDate expenseDate;
    private String description;
    private String receiptUrl;
    private ExpenseStatus status;
}