import { Injectable } from '@angular/core';

const SCHEDULE_REGION = 'schedule-region';

@Injectable({
  providedIn: 'root'
})
export class FilterStorageService {

  constructor() { }

  clearAll() {
    window.sessionStorage.removeItem(SCHEDULE_REGION)
  }
}
