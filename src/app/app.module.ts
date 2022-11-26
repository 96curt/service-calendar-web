import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SideNavOuterToolbarModule, SideNavInnerToolbarModule, SingleCardModule } from './layouts';
import { FooterModule, LoginFormModule } from './shared/components';
import { ScreenService, AppInfoService, AuthHelperService } from './shared/services';
import { UnauthenticatedContentModule } from './unauthenticated-content';
import { AppRoutingModule } from './app-routing.module';
import { ApiModule, ConfigurationParameters, Configuration} from 'openapi/index';
import { environment } from 'environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { StorageService } from './shared/services/storage.service';

export function apiConfigFactory (): Configuration {
  const params: ConfigurationParameters = {
    basePath:environment.apiBaseUrl,
    withCredentials:true
  }
  return new Configuration(params);
}

@NgModule({
  declarations: [
    AppComponent
    ],
  imports: [
    BrowserModule,
    SideNavOuterToolbarModule,
    SideNavInnerToolbarModule,
    SingleCardModule,
    FooterModule,
    LoginFormModule,
    UnauthenticatedContentModule,
    AppRoutingModule,
    HttpClientModule,
    ApiModule.forRoot(apiConfigFactory)
  ],
  providers: [
    ScreenService,
    AppInfoService,
    AuthHelperService,
    StorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
