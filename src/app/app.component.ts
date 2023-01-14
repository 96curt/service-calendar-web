import { Component, HostBinding, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { DxButtonComponent } from 'devextreme-angular';
import { AuthHelperService, ScreenService, AppInfoService } from './shared/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
  }

  constructor(
    private authService: AuthHelperService,
    private screen: ScreenService,
    public appInfo: AppInfoService,
    private injector: Injector,
    ) {
        // Convert Component to a custom element.
        const ButtonElement = createCustomElement(DxButtonComponent, {injector:this.injector});
        // Register the custom element with the browser.
        customElements.define('dx-button', ButtonElement); //button used for scheduler in OnContentReady method.
   }

  isAuthenticated() {
    return this.authService.loggedIn;
  }
}
