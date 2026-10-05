import { Service, signal } from '@angular/core';

@Service()
export class ReturnService {
    public urlList = signal<string[]>([]);

    public loginTimeout = signal<number>(0);  
    public clearTimeout(): void {
        const timeout = this.loginTimeout();
        if (timeout) {
            clearTimeout(timeout);
            this.loginTimeout.set(0);
        }
    }
}
