import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const urlListSessionKey = 'urlListInitialized';

if (sessionStorage.getItem(urlListSessionKey) === null) {
  localStorage.setItem('urlList', JSON.stringify([]));
  sessionStorage.setItem(urlListSessionKey, 'true');
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
