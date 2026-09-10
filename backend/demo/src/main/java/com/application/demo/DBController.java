package com.application.demo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;




@RestController 
@RequestMapping("/pass")
public class DBController {
    private final DBService dbService;

    public DBController(DBService dbService) {
        this.dbService = dbService;
    }

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody UserCreateRequest request) {
        try {
            dbService.createUser(request.userId(), request.userEmail(), request.userName(), request.photoURL());
            return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating user: " + e.getMessage());
        }
    }
}
