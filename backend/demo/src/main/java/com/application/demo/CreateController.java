package com.application.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController 
@RequestMapping ("/create")
public class CreateController {

    @Autowired
    private GeoServerService geoServerService;

    @PostMapping("/create-workspace")
    public ResponseEntity<?> createWorkspace(@RequestParam String userId) {
        try {
            geoServerService.createWorkspace(userId);
            return ResponseEntity.ok("Workspace created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating workspace: " + e.getMessage());
        }
    }

    @PostMapping("/create-datastore")
    public ResponseEntity<?> createDatastore(@RequestParam String userId) {
        try {
            geoServerService.createDatastore(userId);
            return ResponseEntity.ok("Datastore created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating datastore: " + e.getMessage());
        }
    }

    @PostMapping("/create-temp-workspace")
    public ResponseEntity<?> createTempWorkspace(@RequestParam String userId) {
        try {
            geoServerService.createTempWorkspace(userId);
            return ResponseEntity.ok("Temporary workspace created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating temporary workspace: " + e.getMessage());
        }
    }

    @PostMapping("/create-temp-datastore")
    public ResponseEntity<?> createTempDatastore(@RequestParam String userId) {
        try {
            geoServerService.createTempDatastore(userId);
            return ResponseEntity.ok("Temporary datastore created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating temporary datastore: " + e.getMessage());
        }
    }
}
