package com.containerops.expense.entity;

import com.containerops.expense.enums.ExpenseStatus;
import com.containerops.expense.enums.ExpenseType;
import com.containerops.trip.entity.Trip;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseType expenseType;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(length = 500)
    private String description;

    private String receiptUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status;
}