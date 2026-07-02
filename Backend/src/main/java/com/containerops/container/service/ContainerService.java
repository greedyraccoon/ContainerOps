package com.containerops.container.service;

import com.containerops.container.dto.request.ContainerRequestDto;
import com.containerops.container.dto.response.ContainerResponseDto;
import com.containerops.container.enums.ContainerStatus ;


import java.util.List;

public interface ContainerService {
    ContainerResponseDto createContainer(ContainerRequestDto request);
    ContainerResponseDto getContainerById(Long id);
    List<ContainerResponseDto> getAllContainers();
    ContainerResponseDto updateContainer(Long id, ContainerRequestDto request);

    ContainerResponseDto updateContainerStatus(Long id, com.containerops.container.enums.ContainerStatus status);
    void deleteContainer(Long id);

}
