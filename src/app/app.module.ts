import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SideNavOuterToolbarModule, SideNavInnerToolbarModule, SingleCardModule } from './layouts';
import { FooterModule, ResetPasswordFormModule, CreateAccountFormModule, ChangePasswordFormModule, LoginFormModule } from './shared/components';
import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { UnauthenticatedContentModule } from './unauthenticated-content';
import { AppRoutingModule } from './app-routing.module';
import { ApiModule, Configuration, ConfigurationParameters } from 'openapi/index';
import { environment } from 'environments/environment';

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
    ResetPasswordFormModule,
    CreateAccountFormModule,
    ChangePasswordFormModule,
    LoginFormModule,
    UnauthenticatedContentModule,
    AppRoutingModule,
    ApiModule
  ],
  providers: [
    AuthService,
    ScreenService,
    AppInfoService,
    {
      provide: Configuration,
      useFactory: (authService: AuthService) => new Configuration(
        {
          basePath: environment.apiBaseUrl,
          withCredentials:true,
          credentials: {
            apikey:authService.getAccessToken.bind(authService)
          }
        }
      ),
      deps: [AuthService],
      multi: false}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
