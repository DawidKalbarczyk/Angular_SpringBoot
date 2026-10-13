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
                path: 'saved/:userId/:time',
                loadComponent: () => import('./home/history/history-inner/history-inner').then(m => m.HistoryInner),
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./home/history/history-inner/saved/saved').then(m => m.Saved)
                    },
                    {
                        path: 'geoportal-temp',
                        loadComponent: () => import('./home/history/history-inner/geoportal-temp/geoportal-temp').then(m => m.GeoportalTemp)
                    }
                ]
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
