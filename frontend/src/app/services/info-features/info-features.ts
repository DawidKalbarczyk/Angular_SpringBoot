import { Service, signal } from '@angular/core';

@Service()
export class InfoFeatures {
    public properties = signal<any[]>([]);
    public layerWithId = signal<string[]>([]);
    public isInfoReady = signal<boolean>(false);

    updateProperties(newProperties: any[]): void {
        this.properties.update(c => [...c, ...newProperties]);
    }

    updateLayerWithId(layerId: string): void {
        this.layerWithId.update(c => [...c, layerId]);
    }

    clear(): void {
        this.properties.set([]);
        this.layerWithId.set([]);
        this.isInfoReady.set(false);
    }
}
