import { Component, OnInit } from '@angular/core';
import { CollectionNestedOptionContainerImpl, DxSchedulerComponent } from 'devextreme-angular';
import { LoadOptions } from 'devextreme/data';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { Schedule, ServiceService, Technician } from 'openapi';
import { filter, lastValueFrom } from 'rxjs';
import { Value } from 'sass-embedded';
import Form, { SimpleItem } from "devextreme/ui/form";
import { PatternRule } from 'devextreme/ui/validation_rules';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  scheduleDataSource:  CustomStore;
  techDataSource:  CustomStore;
  centerDataSource:  CustomStore;
  sequenceDataSource:  CustomStore;
  addendumDataSource:  CustomStore;

  constructor(private serviceService: ServiceService) {
    this.scheduleDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions:LoadOptions<Schedule>) => {
        
        return lastValueFrom(this.serviceService.serviceSchedulesList())
        .then(response => {
          return {
            data:response,
          }
        })
        .catch(() => { throw 'Error Loading Appointments' });
      },
      insert: (values:Schedule) => {
        return lastValueFrom(this.serviceService.serviceSchedulesCreate(values))
        .catch(() => { throw 'Error Creating Appointment: ' + values.description });
      },
      update: (key:number, values:Schedule) => {
        return lastValueFrom(this.serviceService.serviceScheduleUpdate(key, values))
        .catch(() => { throw 'Error Updating Appointment: ' + key });
      },
      remove: (key:number) => {
        return lastValueFrom(this.serviceService.serviceScheduleDestroy(key))
        .catch(() => { throw 'Error Removing Appointment: ' + key})
      }
    });

    this.techDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceTechsList())
        .then((response:Technician[]) => {
          return {
            data:response,
          }
        })
        .catch(() => { throw 'Error loading technicians' });
      }
    });

    this.centerDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceCentersList())
        .then(response => {
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading Service Centers' });
      }
    });

    this.addendumDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumsList())
        .then(response => {
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading Service Addendums' });
      }
    });

    this.sequenceDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceOrdersSequencesList())
        .then(response => {
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading Service Sequences' });
      }
    })
  }

  ngOnInit(): void {
  }

  

  onAppointmentFormOpening(e:any) {
    e.popup.option('showTitle', true);
    e.popup.option('title', e.appointmentData.text ? 
        e.appointmentData.text : 
        'Create a new appointment');

    const form = e.form as Form;
    let mainGroupItems = form.itemOption('mainGroup').items as Array<any>;
    {
      let index = mainGroupItems.findIndex(function(i:any) { return i.dataField === "description" })
      if (index != -1) {
        mainGroupItems.splice(index, 1);
      }
    }

    //editing form items for resources
    mainGroupItems.forEach((item, index) => {
      if(item.dataField === "technicians" || item.dataField === "serviceCenter" || item.dataField === "description"){
        console.log(item.dataField);
        item.isRequired = true;
      }
    });


    if (!mainGroupItems.find(function(i:any) { return i.dataField === "travelHours" })) {
        mainGroupItems.push({
            colSpan: 2, 
            label: { text: "Travel Hours" },
            editorType: "dxTextBox",
            dataField: "travelHours",
            isRequired: true
        } as SimpleItem);
        form.itemOption('mainGroup', 'items', mainGroupItems);
    }

    if (!mainGroupItems.find(function(i:any) { return i.dataField === "confirm" })) {
      mainGroupItems.push({
          colSpan: 1, 
          label: { text: "Confirm Appointment" },
          editorType: "dxCheckBox",
          dataField: "confirm",
      });
      form.itemOption('mainGroup', 'items', mainGroupItems);
    }

  }

  getAddendum(id:): OrderAddendum {
    return this.addendumDataSource.byKey(id);
  }
  
  getSequence(id){

  }

  getCustomer(schedule:Schedule){
    
    
    
    await this.techDataSource.byKey(techId).then((response) => {
        return response.name;
      });
    
    
    
    return names;
  }
}
