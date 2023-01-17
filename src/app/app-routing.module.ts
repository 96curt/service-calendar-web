import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent} from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DxDataGridModule, DxTemplateHost } from 'devextreme-angular';
import { ScheduleComponent } from './pages/tech-scheduling/schedule/schedule.component';
import { ScheduleModule } from './pages/tech-scheduling/schedule/schedule.module';
import { SpreadsheetComponent } from './pages/tech-scheduling/spreadsheet/spreadsheet.component';
import { SpreadsheetModule } from './pages/tech-scheduling/spreadsheet/spreadsheet.module';
import { TechSchedulingComponent } from './pages/tech-scheduling/tech-scheduling.component';
import { ServiceOrdersComponent } from './pages/service-orders/service-orders.component';
import { TechSchedulingModule } from './pages/tech-scheduling/tech-scheduling.module';

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
    redirectTo: 'pages/tech-scheduling'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    TechSchedulingModule
  ],
  providers: [AuthGuardService, DxTemplateHost],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
    ServiceOrdersComponent
  ]
})
export class AppRoutingModule { }
