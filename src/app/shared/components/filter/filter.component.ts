import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { ValueChangedEvent } from 'devextreme/ui/select_box';
import { Region, RegionsService } from 'openapi';
import { lastValueFrom } from 'rxjs';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  regionStore: CustomStore;
  filterValues: any;

  @Output() onChange = new EventEmitter<any>();

  
  filterVisible = false
  emailButtonOptions: any;
  closeButtonOptions: any;

  constructor(private regionsService: RegionsService) {
    this.emailButtonOptions = {
      icon: 'clear',
      text: 'Clear',
      onClick() {
        
      },
    };

    this.closeButtonOptions = {
      text: 'Close',
      onClick() {
        this.filterVisible = false;
      }
    };

    this.regionStore = new CustomStore({
      load: () => {
        return lastValueFrom(this.regionsService.regionsList())
        .catch(() => { throw 'Error loading regions' });
      }
    });

   }

  ngOnInit(): void {
  }

  onValueChanged(e:ValueChangedEvent){
    this.onChange.emit(e.value);
  }

  displayFilter(){
    this.filterVisible = true
  }
}
