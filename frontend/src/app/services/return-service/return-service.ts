import { Service, signal } from '@angular/core';

@Service()
export class ReturnService {
    public urlList = signal<string[]>([]);
}
