import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { seedDemoIfEmpty } from './app/domain/demo-data';

seedDemoIfEmpty();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
