import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { ValueChangedEvent } from 'devextreme/ui/select_box';
import { Region, RegionsService } from 'openapi';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  regionStore: CustomStore;
  //@Input() techList = Techni
  @Output() onSelected = new EventEmitter<any>();
  
  
  constructor(private regionsService: RegionsService) {
    this.regionStore = new CustomStore({
      load: () => {
        return lastValueFrom(this.regionsService.regionsList())
        .then(response => {
          return {
            data:response,
          }
        })
        .catch(() => { throw 'Error loading regions' });
      }
    });
   }

  ngOnInit(): void {
  }

  onValueChanged(e:ValueChangedEvent){
    this.onSelected.emit(e.value);
  }

}
