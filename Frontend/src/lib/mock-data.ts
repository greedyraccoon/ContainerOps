// Type definitions for ContainerOps domain entities.
// Live data is fetched from the Spring Boot backend via useList/useCreate
// in src/lib/crud.ts — no local mock arrays are shipped anymore.

export type VehicleStatus = "AVAILABLE" | "DISPATCHED" | "MAINTENANCE" | "RETIRED";
export type VehicleType =
  | "PRIME_MOVER"
  | "CONTAINER_CHASSIS"
  | "FLATBED"
  | "LIGHT_COMMERCIAL"
  | "TRUCK"
  | "TRAILER";
export type TripStatus =
  | "PLANNED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELAYED"
  | "ARRIVED"
  | "COMPLETED"
  | "CANCELLED";
export type ShipmentDirection = "IMPORT" | "EXPORT";
export type ShipmentStatus =
  | "BOOKED"
  | "AT_ORIGIN_PORT"
  | "ON_VESSEL"
  | "DISCHARGED_AT_DESTINATION"
  | "INLAND_TRANSIT"
  | "DELIVERED";
export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "REIMBURSED";
export type ExpenseType =
  | "FUEL"
  | "TOLL"
  | "DRIVER_ALLOWANCE"
  | "MAINTENANCE"
  | "WEIGHBRIDGE"
  | "MISCELLANEOUS";
export type DriverStatus = "AVAILABLE" | "ON_ROUTE" | "OFF_DUTY";
export type ContainerStatus = "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE" | "RETIRED";
export type ContainerType = "STANDARD_20FT" | "STANDARD_40FT" | "REFRIGERATED" | "FLAT_RACK";
export type CustomerType =
  | "DIRECT_SHIPPER"
  | "FREIGHT_FORWARDER"
  | "CUSTOMS_BROKER"
  | "MANUFACTURER"
  | "OTHER";

export interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  capacityTons: number;
  type: VehicleType;
  status: VehicleStatus;
}

export interface Trip {
  id: string;
  tripManifestNumber: string;
  vehicleId: string;
  vehicleRegistrationNumber: string;
  containerId: string;
  containerNumber: string;
  driverId: string;
  driverName: string;
  sourceLocation: string;
  destinationLocation: string;
  estimatedDeliveryAt: string;
  startingOdometer: number;
  currentOdometer?: number;
  status: TripStatus;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  customerId: string;
  customerName: string;
  containerId: string;
  containerNumber: string;
  shippingLine: string;
  blNumber: string;
  direction: ShipmentDirection;
  origin: string;
  destination: string;
  etd: string;
  eta: string;
  status: ShipmentStatus;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  tripId: string;
  baseFreightCharge: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  status: InvoiceStatus;
  dueDate: string;
}

export interface Expense {
  id: string;
  tripId: string;
  expenseType: ExpenseType;
  amount: number;
  expenseDate: string;
  description: string;
  receiptUrl: string;
  status: ExpenseStatus;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  status: DriverStatus;
}

export interface Container {
  id: string;
  containerNumber: string;
  type: ContainerType;
  status: ContainerStatus;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  billingAddress: string;
  customerType: CustomerType;
  isActive: boolean;
}

export interface AnalyticsRow {
  tripId: string;
  tripManifestNumber: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  marginPercentage: number;
}
