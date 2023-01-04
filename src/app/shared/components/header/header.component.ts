import { Component, NgModule, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthHelperService } from '../../services';
import { UserPanelModule } from '../user-panel/user-panel.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';

import { Router } from '@angular/router';
import { User, UserService } from 'openapi';
import {take, interval} from 'rxjs';
@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title!: string;

  user: User | null = null;

  userMenuItems = [{
    text: 'Profile',
    icon: 'user',
    onClick: () => {
      this.router.navigate(['/profile']);
    }
  },
  {
    text: 'Logout',
    icon: 'runner',
    onClick: () => {
      this.authService.logOut();
    }
  }];

  constructor(
    private authService: AuthHelperService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
      this.userService.userProfileRetrieve().subscribe({
        next: (response) => {
          this.user = response;
        }
      })
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    UserPanelModule,
    DxToolbarModule
  ],
  declarations: [ HeaderComponent ],
  exports: [ HeaderComponent ]
})
export class HeaderModule { }
