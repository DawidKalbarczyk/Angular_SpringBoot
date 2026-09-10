import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

export interface LayerRequest {
    tableName: string;
    title: string;
}


@Service()
export class GeoserverService {
    private http = inject(HttpClient);
    

    appendLayer(tableName: string, title: string) {
        const layerRequest: LayerRequest = { tableName, title };
        return this.http.post('/create/create-layer', layerRequest);
    }

    deleteTemps(userId: string) {
        console.log('Deleting temporary workspaces and datastores');
        return this.http.delete(`/create/delete-temp?userId=${userId}`, { responseType: 'text' });
    }

    deleteUserData(userId: string) {
        console.log(`Deleting user data for userId: ${userId}`);
        return this.http.delete(`/create/delete-user-data?userId=${userId}`, { responseType: 'text' });
    }

    createUserData(userId: string) {
        console.log(`Creating user data for userId: ${userId}`);
        return this.http.post(`/create/create-user-data?userId=${userId}`, null, { responseType: 'text' });
    }

    createWorkspace(userId: string) {
        console.log(`Creating workspace for userId: ${userId}`);
        return this.http.post(`/create/create-workspace?userId=${userId}`, null, {responseType: 'text'});
    }

    createTempWorkspace(userId: string) {
        console.log(`Creating temporary workspace for userId: ${userId}`);
        return this.http.post(`/create/create-temp-workspace?userId=${userId}`, null, {responseType: 'text'});
    }
    
    createDatastore(userId: string) {
        console.log(`Creating datastore for userId: ${userId}`);
        return this.http.post(`/create/create-datastore?userId=${userId}`, null , {responseType: 'text'});
    }

    createTempDatastore(userId: string) {
        console.log(`Creating temporary datastore for userId: ${userId}`);
        return this.http.post(`/create/create-temp-datastore?userId=${userId}`, null, {responseType: 'text'});
    }
}
