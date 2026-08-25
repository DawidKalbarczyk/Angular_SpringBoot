import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'user',
        loadComponent: () => import('./user/user').then(m => m.User),
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
    },
    {
        path: '**',
        redirectTo: ''
    }
];
