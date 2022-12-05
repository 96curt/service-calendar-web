import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent} from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import {
  DxDataGridModule,
  DxDropDownBoxModule,
  DxFormModule,
  DxSchedulerModule,
  DxTemplateHost,
  DxTemplateModule,
  DxSelectBoxModule
} from 'devextreme-angular';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { FilterComponent } from './shared/components/filter/filter.component';

const routes: Routes = [
  {
    path: 'pages/schedule',
    component: ScheduleComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    DxDataGridModule,
    DxFormModule,
    DxSchedulerModule,
    DxTemplateModule,
    DxDropDownBoxModule,
    DxFormModule,
    DxSelectBoxModule
  ],
  providers: [AuthGuardService,DxTemplateHost],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
    TasksComponent,
    ScheduleComponent,
    FilterComponent
  ]
})
export class AppRoutingModule { }
