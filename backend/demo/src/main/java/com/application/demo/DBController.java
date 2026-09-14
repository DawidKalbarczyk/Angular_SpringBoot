package com.application.demo;

import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;




@RestController 
@RequestMapping("/pass")
public class DBController {
    private final DBService dbService;
    private final JdbcTemplate jdbcTemplate;

    public DBController(DBService dbService, JdbcTemplate jdbcTemplate) {
        this.dbService = dbService;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Mapuje tworzenie użytkownika na metodę HTTP POST.
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@AuthenticationPrincipal FirebaseToken token,
                                        @RequestBody UserCreateRequest request) {
        // Próbuje utworzyć rekord dla UID pobranego z uwierzytelnienia.
        try {
            // UID i e-mail pochodzą z tokenu, a nie z danych przesłanych przez przeglądarkę.
            dbService.createUser(token.getUid(), token.getEmail(), request.userName(), request.photoURL());
            // Zwraca kod 201 po poprawnym utworzeniu rekordu.
            return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
        } catch (Exception e) {
            // Zwraca błąd serwera, jeśli zapis do bazy się nie udał.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating user: " + e.getMessage());
        }
    }

    // Mapuje zmianę profilu na metodę HTTP PATCH.

    @GetMapping("/get-user-data")
    public ResponseEntity<?> getUserData(@AuthenticationPrincipal FirebaseToken token) {
        boolean userExists = dbService.checkUserExists(token.getUid());
        if (!userExists) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String sql = "SELECT id, username, email, \"photoUrl\" FROM users WHERE id = ?";
        UserGetRequest userData = jdbcTemplate.queryForList(sql, token.getUid())
                .stream()
                .findFirst()
                .map(row -> new UserGetRequest(
                        (String) row.get("id"),
                        (String) row.get("username"),
                        (String) row.get("email"),
                        (String) row.get("photoUrl")
                ))
                .orElse(null);
        // Zwraca dane użytkownika w formacie JSON.
        return ResponseEntity.ok(userData);
    }


    @PatchMapping("/update-user-name")
    public ResponseEntity<?> updateUser(@AuthenticationPrincipal FirebaseToken token,
                                        @RequestBody UserUpdateRequest request) {
        // Klient może zmienić profil tylko zalogowanego użytkownika.
        // Odrzuca pustą albo zbyt długą nazwę.
        if (request.userName() == null || request.userName().isBlank() || request.userName().length() > 255) {
            // Informuje klienta, że dane profilu są niepoprawne.
            return ResponseEntity.badRequest().body("Invalid user name");
        }

        try {
            // Aktualizuje Firebase i rekord wskazany wyłącznie przez UID z tokenu.
            boolean updated = dbService.updateUserName(token.getUid(), request.userName().trim());
            // Zwraca sukces albo informację, że użytkownik nie istnieje w bazie.
            return updated ? ResponseEntity.ok("User updated successfully") : ResponseEntity.notFound().build();
        } catch (FirebaseAuthException e) {
            // Zwraca kontrolowany błąd, gdy Firebase odrzuci aktualizację profilu.
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Firebase user update failed: " + e.getMessage());
        }
    }

}
