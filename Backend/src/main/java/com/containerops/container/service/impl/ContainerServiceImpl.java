package com.containerops.container.service.impl;

import com.containerops.container.dto.request.ContainerRequestDto;
import com.containerops.container.dto.response.ContainerResponseDto;
import com.containerops.container.entity.Container;
import com.containerops.container.repository.ContainerRepository;
import com.containerops.container.service.ContainerService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContainerServiceImpl implements ContainerService {

    private final ContainerRepository containerRepository;

    @Override
    public ContainerResponseDto createContainer(ContainerRequestDto request) {
        if (containerRepository.existsByContainerNumber(request.getContainerNumber())) {
            throw new IllegalArgumentException("Container number already exists: " + request.getContainerNumber());
        }

        Container container = Container.builder()
                .containerNumber(request.getContainerNumber())
                .type(request.getType())
                .build();

        Container savedContainer = containerRepository.save(container);
        return mapToResponseDto(savedContainer);
    }

    @Override
    public ContainerResponseDto getContainerById(Long id) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Container not found with ID: " + id));

        return mapToResponseDto(container);
    }

    @Override
    public List<ContainerResponseDto> getAllContainers() {
        return containerRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public ContainerResponseDto updateContainerStatus(Long id, com.containerops.container.enums.ContainerStatus status) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Container not found with ID: " + id));

        container.setStatus(status);
        Container updatedContainer = containerRepository.save(container);

        return mapToResponseDto(updatedContainer);
    }

    @Override
    public void deleteContainer(Long id) {
        if (!containerRepository.existsById(id)) {
            throw new EntityNotFoundException("Cannot delete. Container not found with ID: " + id);
        }
        containerRepository.deleteById(id);
    }
    @Override
    public ContainerResponseDto updateContainer(Long id, ContainerRequestDto request) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Container not found with ID: " + id));

        // If they changed the number, make sure the new number isn't already taken!
        if (!container.getContainerNumber().equals(request.getContainerNumber()) &&
                containerRepository.existsByContainerNumber(request.getContainerNumber())) {
            throw new IllegalArgumentException("Cannot update: Container number " + request.getContainerNumber() + " is already registered to another container.");
        }

        // Update the fields
        container.setContainerNumber(request.getContainerNumber());
        container.setType(request.getType());

        // Save and return
        Container updatedContainer = containerRepository.save(container);
        return mapToResponseDto(updatedContainer);
    }

    // hlper method to map it
    private ContainerResponseDto mapToResponseDto(Container container) {
        return ContainerResponseDto.builder()
                .id(container.getId())
                .containerNumber(container.getContainerNumber())
                .type(container.getType())
                .status(container.getStatus())
                .createdAt(container.getCreatedAt())
                .build();
    }
}