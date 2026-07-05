package com.containerops.expense.controller;

import com.containerops.expense.dto.ExpenseRequestDto;
import com.containerops.expense.dto.ExpenseResponseDto;
import com.containerops.expense.enums.ExpenseStatus;
import com.containerops.expense.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponseDto> logExpense(@Valid @RequestBody ExpenseRequestDto requestDto) {
        return new ResponseEntity<>(expenseService.logExpense(requestDto), HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<ExpenseResponseDto>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponseDto> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<ExpenseResponseDto>> getExpensesByTripId(@PathVariable Long tripId) {
        return ResponseEntity.ok(expenseService.getExpensesByTripId(tripId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponseDto> updateExpenseDetails(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequestDto requestDto) {
        return ResponseEntity.ok(expenseService.updateExpenseDetails(id, requestDto));
    }

    // Operational state transitions (e.g., PENDING -> APPROVED -> REIMBURSED)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ExpenseResponseDto> updateExpenseStatus(
            @PathVariable Long id,
            @RequestParam ExpenseStatus status) {
        return ResponseEntity.ok(expenseService.updateExpenseStatus(id, status));
    }
}