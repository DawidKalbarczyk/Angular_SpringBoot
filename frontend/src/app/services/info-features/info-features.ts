import { Service, signal } from '@angular/core';

@Service()
export class InfoFeatures {
    public properties = signal<any[]>([]);

    updateProperties(newProperties: any[]): void {
        this.properties.update(c => [...c, ...newProperties]);
    }

    clear(): void {
        this.properties.set([]);
    }
}
