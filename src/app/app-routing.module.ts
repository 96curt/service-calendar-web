import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent} from './shared/components';
import { AuthGuard } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { DxDataGridModule, DxFormModule } from 'devextreme-angular';
import { SchedularComponent } from './pages/schedular/schedular.component';


const routes: Routes = [
  {
    path: 'schedular',
    component: SchedularComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), DxDataGridModule, DxFormModule],
  providers: [AuthGuard],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
    TasksComponent,
  ]
})
export class AppRoutingModule { }
