import { provideHttpClient, withFetch } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app';

bootstrapApplication(App, {
  providers: [provideHttpClient(withFetch())],
}).catch((err) => console.error(err));
