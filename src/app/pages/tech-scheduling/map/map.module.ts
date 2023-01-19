import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { DxMapModule, DxSelectBoxModule } from 'devextreme-angular';
import { MapSettingsService } from 'app/shared/services/map-settings.service';

@NgModule({
  declarations: [MapComponent],
  exports: [MapComponent],
  imports: [
    CommonModule,
    DxMapModule,
    DxSelectBoxModule
  ],
  providers: [MapSettingsService]
})
export class MapModule { }
