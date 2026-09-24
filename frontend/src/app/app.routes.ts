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
        path: 'login',
        loadComponent: () => import('./login/login').then(m => m.Login),
    },
    {
        path: 'geoportal',
        loadComponent: () => import('./home/geoportal/geoportal').then(m => m.Geoportal)
    },
    {
        path: 'history',
        loadComponent: () => import('./home/history/history').then(m => m.History),
        children: [
            {
                path: '',
                loadComponent: () => import('./home/history/history-main/history-main').then(m => m.HistoryMain)
            },
            {
                path: 'saved/:innerId',
                loadComponent: () => import('./home/history/history-inner/history-inner').then(m => m.HistoryInner)
            }
        ]
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
