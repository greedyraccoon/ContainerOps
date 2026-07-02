package com.containerops.container.dto.response;

import com.containerops.container.enums.ContainerStatus;
import com.containerops.container.enums.ContainerType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ContainerResponseDto {
    private Long id;
    private String containerNumber;
    private ContainerType type;
    private ContainerStatus status;
    private LocalDateTime createdAt;
}