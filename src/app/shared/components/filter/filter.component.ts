import { Component, EventEmitter, OnInit, Output, Input, ViewChildren } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { ClosedEvent, OpenedEvent, SelectionChangedEvent } from 'devextreme/ui/tag_box';
import { Region, GenericService, ServiceCentersListRequestParams, ServiceService, ServiceManagersListRequestParams, GenericCitiesListRequestParams, GenericZipcodesListRequestParams, ServiceTechsListRequestParams, GenericRegionsListRequestParams } from 'openapi';
import { lastValueFrom } from 'rxjs';
import { Filter } from 'app/shared/models/filter.model';
import { DxButtonComponent, DxSelectBoxComponent, DxTagBoxComponent } from 'devextreme-angular';
import { DxoButtonOptions } from 'devextreme-angular/ui/nested/base/button-options';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Output() onChange = new EventEmitter<Filter>();
  @Input() visible = false;
  @ViewChildren(DxTagBoxComponent, {}) tagBoxes!: DxTagBoxComponent[];
  regionStore: CustomStore;
  centerStore: CustomStore;
  managerStore: CustomStore;
  citiesStore: CustomStore;
  zipStore: CustomStore;
  technicianStore: CustomStore;
  filterValues: Filter = new Filter();
  filterVisible = false;
  clearButtonOptions: any;
  closeButtonOptions: any;

  constructor(
    private genericService: GenericService,
    private serviceService: ServiceService,
  ) {
    const that = this; // https://js.devexpress.com/Demos/WidgetsGallery/Demo/Popup/Overview/
    this.clearButtonOptions = {
      icon: 'clear',
      text: 'Clear All',
      onClick(){
        that.filterValues.clear();
        that.reload();
      }
    }

    this.closeButtonOptions = {
      icon: 'close',
      text: 'Close',
      onClick(){
        that.visible = false;
      }
    };

    this.regionStore = new CustomStore({
      load: () => {
        const params = {
          managersIdIn:this.filterValues.managers
        } as GenericRegionsListRequestParams;
        return lastValueFrom(this.genericService.genericRegionsList(params))
      }
    });

    this.managerStore = new CustomStore({
      load: () => {
        const params = {
            regionIdIn:this.filterValues.regions
        } as ServiceManagersListRequestParams
        return lastValueFrom(this.serviceService.serviceManagersList(params));
      }
    });

    this.centerStore = new CustomStore({
      load: () => {
        const params = {
          regionIdIn:this.filterValues.regions,
          regionManagersIdIn:this.filterValues.managers,
        } as ServiceCentersListRequestParams;
        return lastValueFrom(this.serviceService.serviceCentersList(params));
      },
    });

    this.citiesStore = new CustomStore({
      load: () => {
        const params = {
            regionIdIn:this.filterValues.regions,
            regionManagersIdIn:this.filterValues.managers,
            regionCentersIdIn:this.filterValues.centers
        } as GenericCitiesListRequestParams
        return lastValueFrom(this.genericService.genericCitiesList(params));
      }
    });

    this.zipStore = new CustomStore({
      load: () => {
        const params = {
            regionIdIn:this.filterValues.regions,
            regionManagersIdIn:this.filterValues.managers,
            regionCentersIdIn:this.filterValues.centers,
            citiesIdIn:this.filterValues.cities
        } as GenericZipcodesListRequestParams
        return lastValueFrom(this.genericService.genericZipcodesList(params));
      }
    });

    this.technicianStore = new CustomStore({
      load: () => {
        const params = {
          centersRegionIdIn:this.filterValues.regions,
          centersRegionManagersIdIn:this.filterValues.managers,
          centersIdIn:this.filterValues.centers,
          centersRegionCitiesIdIn:this.filterValues.cities,
          centersRegionZipCodesCodeIn:this.filterValues.zipCodes,
        } as ServiceTechsListRequestParams
        return lastValueFrom(this.serviceService.serviceTechsList(params));
      }
    });
  }

  /*** Events ***/

  ngOnInit(): void {
  }

  onRegionChanged(e:any){
    this.tagBoxes.forEach((values)=> {
      if (!values.label.includes('Region')){
        values.instance.getDataSource()?.reload();
      }
    });
  }

  onManagerChanged(e:any){
    this.tagBoxes.forEach((values)=> {
      if (!values.label.includes('Manager')){
        values.instance.getDataSource()?.reload();
      }
    });
  }

  onCenterChanged(e:any){
    this.tagBoxes.forEach((values)=> {
      if (!values.label.includes('Region') 
      && !values.label.includes('Center')
      && !values.label.includes('Manager')){
        values.instance.getDataSource()?.reload();
      }
    });
  }

  onCityChanged(e:any){
    this.tagBoxes.forEach((values)=> {
      if (values.label.includes('Zip') 
      || values.label.includes('Technician')){
        values.instance.getDataSource()?.reload();
      }
    });
  }

  onZipChanged(e:any){
    this.tagBoxes.forEach((values)=> {
      if (values.label.includes('Technician')){
          values.instance.getDataSource()?.reload();
      }
    });
  }

  onHiding(e:any){
    // send new values to calendar
    this.onChange.emit(this.filterValues);
  }

  displayFilter(){
    // Unhide the Filter
    this.visible = true;
  }

  /*** Helper Methods ***/

  getfullName(item:any){
    if (item)
      return item.firstName + ' ' + item.lastName;
    return null
  }

  reload(){
    this.tagBoxes.forEach((values)=> {
      let ds = values.instance.getDataSource();
      ds.reload();
    });
  }

}