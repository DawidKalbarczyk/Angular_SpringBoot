import { Service, signal } from '@angular/core';

@Service()
export class DarkMode {
    public isDarkMode = localStorage.getItem('darkMode') === 'true' ? signal(true) : signal(false);

}
