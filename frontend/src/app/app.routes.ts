import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home').then(m => m.Home),
    },
    {
        path: 'geoportal',
        loadComponent: () => import('./home/geoportal/geoportal').then(m => m.Geoportal)
    },
    {
        path: 'history',
        loadComponent: () => import('./home/history/history').then(m => m.History),
    },
    {
        path: 'search',
        loadComponent: () => import('./home/search/search').then(m => m.Search),
    }
];
