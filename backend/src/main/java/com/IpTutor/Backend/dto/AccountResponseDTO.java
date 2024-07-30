package com.IpTutor.Backend.dto;

import java.time.LocalDate;

public record AccountResponseDTO(String username, String email, LocalDate accountCreation) {
}
