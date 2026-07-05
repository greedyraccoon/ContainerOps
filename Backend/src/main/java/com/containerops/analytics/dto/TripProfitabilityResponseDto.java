package com.containerops.analytics.dto;

import lombok.Data;

@Data
public class TripProfitabilityResponseDto {
    private Long tripId;
    private String tripManifestNumber;
    private Double totalRevenue; // From Invoice
    private Double totalExpenses; // From Expenses
    private Double netProfit;
    private Double marginPercentage;
}