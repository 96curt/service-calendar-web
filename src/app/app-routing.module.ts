import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent} from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DxDataGridModule, DxTemplateHost } from 'devextreme-angular';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { ScheduleModule } from './pages/schedule/schedule.module';
import { SpreadsheetComponent } from './pages/spreadsheet/spreadsheet.component';
import { SpreadsheetModule } from './pages/spreadsheet/spreadsheet.module';
import { TechSchedulingComponent } from './pages/tech-scheduling/tech-scheduling.component';
import { ServiceOrdersComponent } from './pages/service-orders/service-orders.component';

const routes: Routes = [
  {
    path: 'pages/service-orders',
    component: ServiceOrdersComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'pages/tech-scheduling',
    component: TechSchedulingComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'pages/spreadsheet',
    component: SpreadsheetComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'pages/schedule',
    component: ScheduleComponent,
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
    ScheduleModule,
    SpreadsheetModule
  ],
  providers: [AuthGuardService, DxTemplateHost],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
    TechSchedulingComponent,
    ServiceOrdersComponent
  ]
})
export class AppRoutingModule { }
