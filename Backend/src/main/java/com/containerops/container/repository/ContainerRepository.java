package com.containerops.container.repository;

import com.containerops.container.entity.Container;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContainerRepository extends JpaRepository<Container, Long> {

    Optional<Container> findByContainerNumber(String containerNumber);

    boolean existsByContainerNumber(String containerNumber);
}