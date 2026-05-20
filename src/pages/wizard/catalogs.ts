/**
 * Static catalogs used across the tenant wizard. Kept frontend-only for
 * now — they don't change often and don't need a roundtrip. When they
 * grow we can move them to the API behind /catalogs/*.
 */

import type {
  CivilStatus,
  EducationLevel,
  EmploymentStatus,
  Gender,
  IncomeSource,
  LivingSituation,
  RegimenFiscal,
} from '../../api/tenant-me';

export const REGIMEN_OPTIONS: { value: RegimenFiscal; label: string; description: string }[] = [
  { value: 'fisica', label: 'Persona física', description: 'Eres tú como individuo' },
  { value: 'moral', label: 'Persona moral', description: 'Una empresa o sociedad que rentará el inmueble' },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'femenino', label: 'Femenino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'no_binario', label: 'No binario' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
];

export const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: 'sin_estudios', label: 'Sin estudios' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'preparatoria', label: 'Preparatoria / Bachillerato' },
  { value: 'tecnica', label: 'Carrera técnica' },
  { value: 'licenciatura', label: 'Licenciatura' },
  { value: 'maestria', label: 'Maestría' },
  { value: 'doctorado', label: 'Doctorado' },
];

export const CIVIL_STATUS_OPTIONS: { value: CivilStatus; label: string }[] = [
  { value: 'soltero', label: 'Soltero(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'union_libre', label: 'Unión libre' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viudo', label: 'Viudo(a)' },
];

export const LIVING_SITUATION_OPTIONS: { value: LivingSituation; label: string; description: string }[] = [
  { value: 'rentado', label: 'Vivo en inmueble rentado', description: 'Pagas renta hoy' },
  { value: 'propio', label: 'Vivo en inmueble propio', description: 'Eres dueño' },
  { value: 'familiar', label: 'Vivo con familia', description: 'Es de un familiar' },
  { value: 'otro', label: 'Otro', description: 'Cualquier otra situación' },
];

export const EMPLOYMENT_STATUS_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: 'empleado', label: 'Empleado(a)' },
  { value: 'dueno_negocio', label: 'Dueño de negocio' },
  { value: 'independiente', label: 'Independiente (freelancer, contratista)' },
  { value: 'jubilado', label: 'Jubilado(a) / Pensionado(a)' },
  { value: 'desempleado', label: 'Desempleado(a)' },
  { value: 'estudiante', label: 'Estudiante' },
];

export const INCOME_SOURCE_OPTIONS: { value: IncomeSource; label: string }[] = [
  { value: 'nomina', label: 'Nómina' },
  { value: 'mixto', label: 'Mixto (nómina + otros ingresos)' },
  { value: 'honorarios', label: 'Honorarios' },
  { value: 'dividendos', label: 'Dividendos' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'ayuda_familiar', label: 'Ayuda familiar' },
  { value: 'pension_retiro', label: 'Pensión / Retiro' },
  { value: 'rentas', label: 'Rentas' },
  { value: 'otro', label: 'Otro' },
];

export const INDUSTRY_OPTIONS: string[] = [
  'Tecnología',
  'Salud',
  'Educación',
  'Servicios financieros',
  'Manufactura',
  'Comercio / retail',
  'Construcción',
  'Restaurantes y hospitalidad',
  'Turismo',
  'Transporte y logística',
  'Bienes raíces',
  'Consultoría',
  'Legal',
  'Medios y entretenimiento',
  'Energía',
  'Agropecuario',
  'Gobierno',
  'ONG / Sector social',
  'Otro',
];

/**
 * 32 Mexican states + país-extranjero placeholder. Used in datos personales
 * (lugar de nacimiento) y domicilio (estado). When the user picks
 * "Extranjero" en lugar de nacimiento, ocultamos el estado mx y mostramos
 * un input de país libre.
 */
export const MEXICO_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
] as const;

export const COUNTRIES_COMMON = [
  'Argentina',
  'Brasil',
  'Canadá',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Francia',
  'Guatemala',
  'Honduras',
  'Italia',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Reino Unido',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro',
] as const;
