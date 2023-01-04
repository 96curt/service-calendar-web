export * from './auth.service';
import { AuthService } from './auth.service';
export * from './generic.service';
import { GenericService } from './generic.service';
export * from './service.service';
import { ServiceService } from './service.service';
export * from './user.service';
import { UserService } from './user.service';
export const APIS = [AuthService, GenericService, ServiceService, UserService];
