// Project Pricing Feature — Public Exports
export type {
  ProjectService,
  AddServiceSnapshotInput,
  AddCustomLineInput,
  UpdateProjectServiceInput,
  ServicePickerItem,
  PackagePickerItem,
} from './types/projectPricingTypes';
export { computeNetLineTotal, computeProjectValue } from './types/projectPricingTypes';

export { projectServiceFormSchema } from './schemas/projectPricingSchemas';
export type { ProjectServiceFormValues } from './schemas/projectPricingSchemas';

export { useProjectServices } from './hooks/useProjectServices';
export { useProjectServiceMutations } from './hooks/useProjectServiceMutations';

export { ProjectPricingSection } from './components/ProjectPricingSection';
export { ProjectServiceRow } from './components/ProjectServiceRow';
export { PricingSummary } from './components/PricingSummary';
