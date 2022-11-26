export * from './auth.service';
import { AuthService } from './auth.service';
export * from './customers.service';
import { CustomersService } from './customers.service';
export * from './profile.service';
import { ProfileService } from './profile.service';
export * from './service.service';
import { ServiceService } from './service.service';
export const APIS = [AuthService, CustomersService, ProfileService, ServiceService];
