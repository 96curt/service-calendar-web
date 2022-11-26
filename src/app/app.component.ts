import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { ScreenService, AppInfoService, AuthHelperService } from './shared/services';

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
    private screen: ScreenService,
    public appInfo: AppInfoService,
    private authHelperService: AuthHelperService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  isAuthenticated(): boolean{
    return this.authHelperService.isLoggedIn;
  }

}
