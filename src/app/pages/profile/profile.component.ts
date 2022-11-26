import { Component } from '@angular/core';
import { StorageService } from 'app/shared/services/storage.service';
import { ProfileService } from 'openapi/api/profile.service';

@Component({
  templateUrl: 'profile.component.html',
  styleUrls: [ './profile.component.scss' ]
})

export class ProfileComponent {
  user: any;
  profile: any;
  colCountByScreen: object;

  constructor(
    private profileService: ProfileService,
    private storageService: StorageService
  ) {
    this.profileService.profileRetrieve("body").subscribe({
      next(response) {
        storageService.saveUser(response);
      },
    });
    this.user = storageService.getUser()!;
    this.profile = this.user.profile;
    this.colCountByScreen = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4
    };
  }
}
