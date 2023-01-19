import { Injectable } from '@angular/core';

export interface MapSettings {
  key: string;
  name: string;
}

const mapTypes: MapSettings[] = [{
  key: 'roadmap',
  name: 'Road Map',
}, {
  key: 'satellite',
  name: 'Satellite (Photographic) Map',
}, {
  key: 'hybrid',
  name: 'Hybrid Map',
}];

@Injectable({
  providedIn: 'root'
})
export class MapSettingsService {
  getMapTypes(): MapSettings[] {
    return mapTypes;
  }
}
