import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthHelperService } from 'app/shared/services';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import notify from 'devextreme/ui/notify';



@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loading = false;
  formData: any = {};

  constructor(
    private authHelperService: AuthHelperService,
    private router: Router) { }

  onSubmit(e: Event) {
    e.preventDefault();
    const { username, password } = this.formData;
    this.loading = true;
    this.authHelperService.login(username, password)
    .subscribe({
        error: (error) => {
          console.log(username + ': ' + error.error.non_field_errors[0]);
          notify(error.error.non_field_errors[0],'error', 2000);
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
