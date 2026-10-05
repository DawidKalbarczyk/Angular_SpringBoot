import { Service, signal, effect } from '@angular/core';

@Service()
export class ReturnService  {
    public urlList = signal<string[]>(this.loadUrlList());
    public loginTimeout = signal<number>(0);  

    constructor() {
        console.log('urlLIST TTTTTT TTTT', this.urlList());
        effect(() => {
            localStorage.setItem('urlList', JSON.stringify(this.urlList()));
        });
    }
    
    private loadUrlList(): string[] {
        try {
            return JSON.parse(localStorage.getItem('urlList') || '[]');
        } catch (error) {
            console.error('Error parsing urlList from localStorage:', error);
            return [];
        }
    }
    public clearTimeout(): void {
        const timeout = this.loginTimeout();
        if (timeout) {
            clearTimeout(timeout);
            this.loginTimeout.set(0);
        }
    }
}
