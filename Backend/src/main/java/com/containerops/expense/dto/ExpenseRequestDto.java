package com.containerops.expense.dto;

import com.containerops.expense.enums.ExpenseType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExpenseRequestDto {

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotNull(message = "Expense type is required")
    private ExpenseType expenseType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.1", message = "Amount must be greater than zero")
    private Double amount;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private String description;

    private String receiptUrl;
}