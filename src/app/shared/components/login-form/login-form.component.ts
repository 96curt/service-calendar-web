import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HomeComponent } from 'app/pages/home/home.component';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import notify from 'devextreme/ui/notify';
import { AuthHelperService } from '../../services';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loading = false;
  formData: any = {};

  constructor(private authService: AuthHelperService, private router: Router) { }

  onSubmit(e: Event) {
    e.preventDefault();
    const { username, password } = this.formData;
    this.loading = true;
    this.authService.login(username, password)
    .subscribe({
        error: (error) => {
          notify(error.message,'error', 2000);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.router.navigate(['/home']);
        }
      });
  }
}
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DxFormModule,
    DxLoadIndicatorModule
  ],
  declarations: [ LoginFormComponent ],
  exports: [ LoginFormComponent ]
})
export class LoginFormModule { }
