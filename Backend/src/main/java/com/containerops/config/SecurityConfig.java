package com.containerops.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer; // Note the new import
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1. Open Endpoints (Preflight CORS and Login)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // 2.  Financials & Analytics: Fully locked to Admin and Accountant

                        .requestMatchers("/api/v1/invoices/**", "/api/v1/expenses/**", "/api/v1/analytics/**")
                        .hasAnyRole("ADMIN", "ACCOUNTANT")

                        // 3. 🚚 Logistics Operations: Read & Status Updates
                        // Dispatchers can read trips/shipments and update live statuses like IN_TRANSIT.
                        .requestMatchers(HttpMethod.GET, "/api/v1/trips/**", "/api/v1/shipments/**")
                        .hasAnyRole("ADMIN", "MANAGER", "DISPATCHER")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/trips/*/status", "/api/v1/shipments/*/status")
                        .hasAnyRole("ADMIN", "MANAGER", "DISPATCHER")

                        // 4. 🚚 Logistics Operations: Core Planning
                        // Only Admins and Managers can POST new trips, PUT details, or PATCH shipments to trips.
                        .requestMatchers("/api/v1/trips/**", "/api/v1/shipments/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // 5. 🏗️ Master Data: Read Access
                        // Operations staff need to view lists of drivers, vehicles, containers, and customers to do their jobs.
                        .requestMatchers(HttpMethod.GET, "/api/v1/vehicles/**", "/api/v1/drivers/**", "/api/v1/containers/**", "/api/v1/customers/**")
                        .hasAnyRole("ADMIN", "MANAGER", "DISPATCHER")

                        // 6. 🏗️ Master Data: Soft Modifications (Status Toggles)
                        // Managers can toggle active/inactive states on master records.
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/vehicles/*/status", "/api/v1/drivers/*/status", "/api/v1/containers/*/status", "/api/v1/customers/*/status")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // Only Admins can POST new records, PUT structural details, or DELETE entities.
                        .requestMatchers("/api/v1/vehicles/**", "/api/v1/drivers/**", "/api/v1/containers/**", "/api/v1/customers/**")
                        .hasRole("ADMIN")
                        // 8. Fallback Safety Net
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}