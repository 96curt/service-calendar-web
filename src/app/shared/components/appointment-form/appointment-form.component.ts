// https://github.com/DevExpress-Examples/scheduler-how-to-create-custom-editing-form/
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Appointment, EditAppointment } from 'app/shared/services/appointment.service';
import { AppointmentTypeService } from 'app/shared/services/appointmentType.service';
import { DxFormComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { formatDate} from 'devextreme/localization';
import { ClickEvent, dxButtonOptions } from 'devextreme/ui/button';
import { dxDateBoxOptions } from 'devextreme/ui/date_box';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { ServiceCentersListRequestParams, ServiceOrderAddendumsListRequestParams, ServiceService, ServiceTechsListRequestParams } from 'openapi';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnChanges {
  @ViewChild(DxFormComponent, { static: false }) formComponent!: DxFormComponent;
  @Input() visible = false; // DxPopup Visibility
  @Output() visibleChange = new EventEmitter<boolean>;
  @Input() appointmentData: Appointment | null = null; // Data for appointment form
  @Output() appointmentDataChange = new EventEmitter<Appointment>;
  @Input() techniciansDataSource = {};
  typeDataSource;
  
  centerDataSource: DataSource;
  addendumDataSource: DataSource;
  title = 'Create a new appointment'; // DxPopup title
  dateEditorOptions;
  submitButtonOptions;
  cancelButtonOptions;
  formData = new EditAppointment();
  constructor(
    private serviceService: ServiceService,
    private typeService: AppointmentTypeService
  ) {
    this.submitButtonOptions = {
      text: 'Done',
      onClick: (e:ClickEvent) => {
        this.submit()
      }
    } as dxButtonOptions;
    this.cancelButtonOptions = {
      text: 'Cancel',
      onClick: () => {
        this.visibleChange.emit(false);
      }
    };
    this.dateEditorOptions = {
      type:'datetime'
    } as dxDateBoxOptions;
    this.typeDataSource = this.typeService.getAppointmentTypes();
    
    this.centerDataSource = new DataSource({
      key: 'id',
      load: () => {
        const params = {
          techniciansIdIn:this.formData.technicians
        } as ServiceCentersListRequestParams;
        return lastValueFrom(this.serviceService.serviceCentersList(params));
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceCenterRetrieve({id:key}));
      }
    });
    this.addendumDataSource = new DataSource({
      key: 'id',
      load: () => {
        const params = {
          sequenceJobSiteRegionCentersTechniciansIdIn:this.formData.technicians,
          sequenceJobSiteRegionCentersIdIn: [this.formData.serviceCenter]

        } as ServiceOrderAddendumsListRequestParams;
        return lastValueFrom(this.serviceService.serviceOrderAddendumsList({}));
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumRetrieve({id:key}));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible']) {
      if(changes['visible'].currentValue)
        this.unserializeDates();
    } 
  }

  /**
   * DxPopup onHiding event handler
   * @param e Hiding event data
   */
  onHiding(e:any) {
    this.visibleChange.emit(this.visible);
    this.formData = new EditAppointment();
  }

  onAppointmentTypeChange(e:any) {
    
  }

  onTechniciansChange(e:any) {

  }

  onCenterChange(e:any) {

  }

  onAddendumChange(e:any) {

  }

  unserializeDates() {
    if(this.formData.startDateTime && this.formData.endDateTime){
      let start = new Date(this.formData.startDateTime);
      let end = new Date(this.formData.endDateTime);
      this.formData.startDate = start;
      this.formData.endDate = end;
    }
  }

  serializeDates() {  
    let start = formatDate(this.formData.startDate, environment.dateTimeFormat);
    let end = formatDate(this.formData.endDate, environment.dateTimeFormat);
    this.formData.startDateTime = start;
    this.formData.endDateTime = end;
  }

  getfullName(item:any) {
    if (item)
      return item.firstName + ' ' + item.lastName;
    return null;
  }

  submit() {
    let valid = this.formComponent.instance.validate();
    this.serializeDates();
    if(valid.isValid) {
      this.appointmentDataChange.emit(this.formData as Appointment);
      this.visibleChange.emit(false);
    } 
  }
}
