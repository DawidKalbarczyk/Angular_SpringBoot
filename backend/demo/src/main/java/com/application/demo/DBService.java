package com.application.demo;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DBService {
    private final JdbcTemplate jdbcTemplate;

    public DBService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean checkUserExists(String userId) {
        String sql = "SELECT COUNT(*) FROM users WHERE user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null && count > 0;
    }

    public void createUser(String userId, String userEmail, String userName, String photoURLString) {
        String sql = "INSERT INTO users (id, username, email, \"photoUrl\") VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, userId, userName, userEmail, photoURLString);
    }

}
