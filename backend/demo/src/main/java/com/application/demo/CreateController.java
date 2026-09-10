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

    @DeleteMapping("/delete-temp")
    public ResponseEntity<?> deleteTemp(@RequestParam String userId) {
        try {
            geoServerService.deleteTemp(userId); // Replace "user123" with the actual user ID
            return ResponseEntity.ok("Temporary workspaces and datastores deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting temporary workspaces and datastores: " + e.getMessage());
        }
    }

    @DeleteMapping ("/delete-user-data")
    public ResponseEntity<?> deleteUserData(@RequestParam String userId) {
        try {
            geoServerService.deleteUserData(userId);
            return ResponseEntity.ok("User data deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting user data: " + e.getMessage());
        }
    }

    @PostMapping("/create-user-data")
    public ResponseEntity<?> createUserData(@RequestParam String userId) {
        try {
            geoServerService.createWorkspace(userId);
            geoServerService.createDatastore(userId);

            return ResponseEntity.ok("User data created successfully for id: " + userId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating user data: " + e.getMessage());
        }
    }

    @PostMapping("/create-workspace")
    public ResponseEntity<?> createWorkspace(@RequestParam String userId) {
        try {
            boolean created = geoServerService.createWorkspace(userId);
            if (created) {
                return ResponseEntity.ok("Workspace created successfully");
            } else {
                return ResponseEntity.ok("Workspace already exists for user: " + userId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating workspace: " + e.getMessage());
        }
    }

    @PostMapping("/create-datastore")
    public ResponseEntity<?> createDatastore(@RequestParam String userId) {
        try {
            boolean created = geoServerService.createDatastore(userId);
            if (created) {
                return ResponseEntity.ok("Datastore created successfully");
            } else {
                return ResponseEntity.ok("Datastore already exists for user: " + userId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating datastore: " + e.getMessage());
        }
    }

    @PostMapping("/create-temp-workspace")
    public ResponseEntity<?> createTempWorkspace(@RequestParam String userId) {
        try {
            boolean created = geoServerService.createTempWorkspace(userId);
            if (created) {
                return ResponseEntity.ok("Temporary workspace created successfully");
            } else {
                return ResponseEntity.ok("Temporary workspace already exists for user: " + userId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating temporary workspace: " + e.getMessage());
        }
    }

    @PostMapping("/create-temp-datastore")
    public ResponseEntity<?> createTempDatastore(@RequestParam String userId) {
        try {
            boolean created = geoServerService.createTempDatastore(userId);
            if (created) {
                return ResponseEntity.ok("Temporary datastore created successfully");
            } else {
                return ResponseEntity.ok("Temporary datastore already exists for user: " + userId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating temporary datastore: " + e.getMessage());
        }
    }
}
