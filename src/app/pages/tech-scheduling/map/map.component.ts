import { Component, Input, OnInit } from '@angular/core';
import { MapSettings, MapSettingsService } from 'app/shared/services/map-settings.service';
import CustomStore from 'devextreme/data/custom_store';
import { environment } from 'environments/environment';
import { Schedule, ServiceService } from 'openapi';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  keys = {bing:environment.bingKey};
  mapTypes = this.mapSettings.getMapTypes();
  @Input() scheduleResource:CustomStore = new CustomStore;
  markers: Schedule[] = [];
  constructor(
    private mapSettings: MapSettingsService,
    private serviceService: ServiceService
  ) {
    lastValueFrom(this.serviceService.serviceSchedulesList({}))
    .then( (value) => {
      this.markers = value;
    })
  }


}
