package com.containerops.container.controller;

import com.containerops.container.dto.request.ContainerRequestDto;
import com.containerops.container.dto.response.ContainerResponseDto;
import com.containerops.container.service.ContainerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/containers")
@RequiredArgsConstructor
public class ContainerController {

    private final ContainerService containerService;

    @PostMapping
    public ResponseEntity<ContainerResponseDto> createContainer(
            @Valid @RequestBody ContainerRequestDto request) {
        return new ResponseEntity<>(containerService.createContainer(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContainerResponseDto> getContainerById(@PathVariable Long id) {
        return ResponseEntity.ok(containerService.getContainerById(id));
    }

    @GetMapping
    public ResponseEntity<List<ContainerResponseDto>> getAllContainers() {
        return ResponseEntity.ok(containerService.getAllContainers());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ContainerResponseDto> updateContainerStatus(
            @PathVariable Long id,
            @RequestParam com.containerops.container.enums.ContainerStatus status) {
        return ResponseEntity.ok(containerService.updateContainerStatus(id, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContainerResponseDto> updateContainer(
            @PathVariable Long id,
            @Valid @RequestBody ContainerRequestDto request) {
        return ResponseEntity.ok(containerService.updateContainer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContainer(@PathVariable Long id) {
        containerService.deleteContainer(id);
        return ResponseEntity.noContent().build();
    }
}