import type { Company, Service } from "@prisma/client";

// ---- Request DTOs ----
export interface CreateCompanyRequest {
  name: string;
  registrationNumber: string;
}

export interface CreateServiceRequest {
  companyId: number;
  name: string;
  description: string;
  price: number;
}

// ---- Response DTOs ----
export interface ServiceResponse {
  id: number;
  companyId: number;
  name: string;
  description: string;
  price: number;
}

export interface CompanyResponse {
  id: number;
  name: string;
  registrationNumber: string;
  services: ServiceResponse[];
}

export interface ErrorResponse {
  error: string;
  details?: string[];
}

// ---- Mappers (database model -> response DTO) ----
export function toServiceResponse(service: Service): ServiceResponse {
  return {
    id: service.id,
    companyId: service.companyId,
    name: service.name,
    description: service.description,
    price: service.price.toNumber(),
  };
}

export function toCompanyResponse(
  company: Company & { services: Service[] }
): CompanyResponse {
  return {
    id: company.id,
    name: company.name,
    registrationNumber: company.registrationNumber,
    services: company.services.map(toServiceResponse),
  };
}
