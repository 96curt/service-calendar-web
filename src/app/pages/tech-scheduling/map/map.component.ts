import { Component, OnInit } from '@angular/core';
import { MapSettings, MapSettingsService } from 'app/shared/services/map-settings.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  keys = {bing:environment.bingKey};
  mapTypes = this.mapSettings.getMapTypes();
  constructor(
    private mapSettings: MapSettingsService
  ) {}

}
