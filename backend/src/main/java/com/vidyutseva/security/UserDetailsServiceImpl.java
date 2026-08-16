package com.vidyutseva.security;

import com.vidyutseva.entity.CustomerEntity;
import com.vidyutseva.entity.StaffEntity;
import com.vidyutseva.repository.CustomerRepository;
import com.vidyutseva.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Loads users from customers, staff, or a hardcoded admin record.
 * Identifier format: "ROLE::userId"  e.g. "CUSTOMER::tanvi_2004"
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // identifier = "ROLE::userId"
        String[] parts = identifier.split("::", 2);
        if (parts.length != 2) throw new UsernameNotFoundException("Invalid identifier: " + identifier);

        String role = parts[0];
        String userId = parts[1];

        return switch (role) {
            case "ADMIN" -> {
                if ("admin".equals(userId)) {
                    yield User.builder()
                            .username("admin")
                            .password("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy") // Admin@123
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                            .build();
                }
                throw new UsernameNotFoundException("Admin not found");
            }
            case "STAFF" -> {
                StaffEntity staff = staffRepository.findByStaffId(userId)
                        .orElseThrow(() -> new UsernameNotFoundException("Staff not found: " + userId));
                yield User.builder()
                        .username(staff.getStaffId())
                        .password(staff.getPassword())
                        .authorities(List.of(new SimpleGrantedAuthority("ROLE_STAFF")))
                        .build();
            }
            case "CUSTOMER" -> {
                CustomerEntity customer = customerRepository.findByUserId(userId)
                        .orElseThrow(() -> new UsernameNotFoundException("Customer not found: " + userId));
                yield User.builder()
                        .username(customer.getUserId())
                        .password(customer.getPassword())
                        .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                        .build();
            }
            default -> throw new UsernameNotFoundException("Unknown role: " + role);
        };
    }
}
