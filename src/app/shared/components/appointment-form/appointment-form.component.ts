// https://github.com/DevExpress-Examples/scheduler-how-to-create-custom-editing-form/
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FilterModel } from 'app/shared/models/filter.model';
import { Appointment, AppointmentModel } from 'app/shared/models/appointment.model';
import { AppointmentTypeService } from 'app/shared/services/appointmentType.service';
import { DxFormComponent, DxSelectBoxComponent, DxTagBoxComponent } from 'devextreme-angular';
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
  @ViewChildren('dx-selectbox', {}) selectBoxes!: (DxTagBoxComponent | DxSelectBoxComponent)[] ;
  @Input() visible = false; // DxPopup Visibility
  @Output() visibleChange = new EventEmitter<boolean>;
  @Input() appointmentData?: Appointment | undefined // Data for appointment form
  @Output() appointmentDataChange = new EventEmitter<Appointment>;
  @Input() filterValues: FilterModel = new FilterModel;
  typeDataSource;
  techniciansDataSource: DataSource;
  centerDataSource: DataSource;
  addendumDataSource: DataSource;
  title = 'Create a new appointment'; // DxPopup title
  dateEditorOptions;
  submitButtonOptions;
  cancelButtonOptions;
  formData = new AppointmentModel();
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
    this.techniciansDataSource = new DataSource({
      key: 'id',
      loadMode: 'processed',
      load: () => {
        const prams = {
          centersRegionIdIn:this.filterValues.regions,
          centersRegionManagersIdIn:this.filterValues.managers,
          centersIdIn:this.filterValues.centers,
          centersRegionCitiesIdIn:this.filterValues.cities,
          centersRegionZipCodesCodeIn:this.filterValues.zipCodes,
          idIn:this.filterValues.techs
        } as ServiceTechsListRequestParams;
        return lastValueFrom(this.serviceService.serviceTechsList(prams));
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceTechRetrieve({id:key}));
      }
    });
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
    if(changes['visible'] && changes['appointmentData']) {
      if(changes['visible'].currentValue && changes['appointmentData'].currentValue != null){
        Object.assign(this.formData, changes['appointmentData'].currentValue);
        this.unserializeDates();
        for(let box of this.selectBoxes){
          box.instance.getDataSource().reload();
        }
      }
    } 
  }

  /**
   * DxPopup onHiding event handler
   * @param e Hiding event data
   */
  onHiding(e:any) {
    this.visibleChange.emit(this.visible);
    this.formData = new AppointmentModel();
  }

  onAppointmentTypeChange(e:any) {
    console.log("appointmentType");
  }

  onTechniciansChange(e:any) {
    console.log("Technician");
  }

  onCenterChange(e:any) {
    console.log("Center");
  }

  onAddendumChange(e:any) {
    console.log("Addendum");
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
    let start = formatDate(<Date>this.formData.startDate, environment.dateTimeFormat);
    let end = formatDate(<Date>this.formData.endDate, environment.dateTimeFormat);
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