import { effect, Service, signal } from '@angular/core';
import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Style, Text, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

@Service()
export class ZoomToObject {
    private coordinates = signal<[number, number]>([0, 0]);
    private map: Map | null = null;
    private vectorL: VectorImageLayer | null  = null;
    private selectedFeature: Feature | null = null;
    public isHighlightedService = signal<boolean>(false);
    public isListRendered = signal<boolean>(true);
    
    private highlightSource = new VectorSource();
    private highlightLayer = new VectorLayer({
        source: this.highlightSource,
        zIndex: 999999, // Ensure it's ALWAYS on top
        style: (feature) => {
            return new Style({
                image: new CircleStyle({
                    radius: 10,
                    fill: new Fill({ color: 'red' }),
                    stroke: new Stroke({ color: '#fff', width: 3 }),
                }),
                text: new Text({
                    text: feature.get('nazwa'),
                    offsetY: -35,
                    font: 'bold 35px Roboto Flex',
                    stroke: new Stroke ({ color: '#fff', width: 5 }),
                })
            });
        }
    });

    constructor() {
        effect(() => {
            this.isHighlightedService();
            this.vectorL?.changed();
            if (this.isHighlightedService()) {
                this.highlightLayer.setVisible(true);
            } else {
                this.highlightLayer.setVisible(false);
            }
        });
    }

    
    setHighlightedService(state?: boolean): void {
        if (state !== undefined) {
            this.isHighlightedService.set(state);
        } else {
            this.isHighlightedService.set(!this.isHighlightedService());
        }
    }

    setMap(map: Map): void {
        this.map = map;
        this.map.addLayer(this.highlightLayer);
    }

    vectorLayer(layer: VectorImageLayer): void {
        this.vectorL = layer;
    }

    zoomToCoordinates(wkb_geometry: string, idprng: number): void {
        if (!this.map) {
            alert('Map is not initialized yet. Please wait and try again.')
            return;
        }
        const geometry = JSON.parse(wkb_geometry);
        this.coordinates.set([geometry.coordinates[0], geometry.coordinates[1]]);
        this.map?.getView().animate({
            center: fromLonLat(this.coordinates()),
            zoom: 10,
            duration: 1000,
        });
        
        this.highlightFeature(idprng);

        console.log('Zooming to coordinates:', this.coordinates());
    }

    private highlightFeature(idprng: number): void {
        const source = this.vectorL?.getSource() as VectorSource | undefined;
        if (!source) {
            console.warn('Brak source w vectorLayer')
            return;
        }

        if (this.selectedFeature) {
            this.selectedFeature.set('highlighted', false);
            this.isHighlightedService.set(false);
        }
        this.highlightSource.clear();

        const features = source.getFeatures();


        const match = features.find((feature) => 
            Number(feature.get('idprng')) === Number(idprng));
            
        if (match) {
            match.set('highlighted', true);
            this.selectedFeature = match;
            const clone = match.clone();
            this.highlightSource.addFeature(clone);
            this.isHighlightedService.set(true);
        } else {
            console.warn(`Feature with idprng ${idprng} not found.`);
            this.selectedFeature = null;
            this.isHighlightedService.set(false);
        }

        this.vectorL?.changed();
    }
}
