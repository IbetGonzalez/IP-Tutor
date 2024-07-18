package com.IpTutor.Backend.dto;

import java.time.LocalDate;

public record AccountDTO(String username, String email, LocalDate accountCreation) {
}
