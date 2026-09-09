package com.application.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/analysys")
public class AnalysysController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private GeoServerService geoServerService;

    @GetMapping("/get_analysys")
    public Map<String, Object> getAnalysys(@RequestParam String searchTerm) {
        Map<String, Object> response = new HashMap<>();
        try {
            String sql = "SELECT idprng, ST_AsGeoJSON(ST_Transform(wkb_geometry, 4326)), nazwa, rodzaj, powiat, gmina FROM sql_data WHERE nazwa LIKE ?";
            String pattern = "%" + searchTerm + "%";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, pattern);
            response.put("data", results);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    @PostMapping("/create-layer")
    public ResponseEntity<?> createLayer(@RequestBody LayerRequest layerRequest) {
        try {
            geoServerService.publishLayer(layerRequest.tableName(), layerRequest.title(), layerRequest.userId());
            return ResponseEntity.ok("Layer created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating layer: " + e.getMessage());
        }
    }
    
}

