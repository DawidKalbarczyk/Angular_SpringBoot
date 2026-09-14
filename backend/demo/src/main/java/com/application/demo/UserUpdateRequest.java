// Umieszcza DTO w pakiecie aplikacji.
package com.application.demo;

// UID nie jest przyjmowany od klienta; backend pobiera go z Firebase tokenu.
public record UserUpdateRequest(String userName, String photoURL) {
	// Record przechowuje nazwę i zdjęcie, które użytkownik chce zmienić.
}