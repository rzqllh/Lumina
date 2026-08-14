export type PaymentType = 'dp' | 'installment' | 'final' | 'other';
export type PaymentStatus = 'pending' | 'paid';
export type TemporalPaymentCondition = 'paid' | 'upcoming' | 'due_today' | 'overdue';

export interface Payment {
  id: string;
  workspace_id: string;
  project_id: string;
  type: PaymentType;
  label: string | null;
  amount: number; // BigInt represented as number
  due_date: string; // YYYY-MM-DD
  status: PaymentStatus;
  paid_date: string | null; // YYYY-MM-DD
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentInput {
  workspace_id: string;
  project_id: string;
  type: PaymentType;
  label?: string | null;
  amount: number;
  due_date: string;
  status?: PaymentStatus;
  paid_date?: string | null;
  payment_method?: string | null;
  notes?: string | null;
}

export interface UpdatePaymentInput {
  type?: PaymentType;
  label?: string | null;
  amount?: number;
  due_date?: string;
  status?: PaymentStatus;
  paid_date?: string | null;
  payment_method?: string | null;
  notes?: string | null;
}

export interface Expense {
  id: string;
  workspace_id: string;
  project_id: string;
  label: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string | null;
  receipt_file_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  workspace_id: string;
  project_id: string;
  label: string;
  amount: number;
  date: string;
  category?: string | null;
  notes?: string | null;
}

export interface UpdateExpenseInput {
  label?: string;
  amount?: number;
  date?: string;
  category?: string | null;
  notes?: string | null;
}

export interface Collaborator {
  id: string;
  workspace_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollaboratorEngagement {
  id: string;
  workspace_id: string;
  project_id: string;
  collaborator_id: string;
  role_label: string;
  agreed_fee: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  paid_amount: number;
  notes: string | null;
  collaborator?: Collaborator;
  created_at: string;
  updated_at: string;
}

export interface CreateCollaboratorEngagementInput {
  workspace_id: string;
  project_id: string;
  collaborator_id: string;
  role_label: string;
  agreed_fee: number;
  payment_status?: 'unpaid' | 'partial' | 'paid';
  paid_amount?: number;
  notes?: string | null;
}

export interface UpdateCollaboratorEngagementInput {
  role_label?: string;
  agreed_fee?: number;
  payment_status?: 'unpaid' | 'partial' | 'paid';
  paid_amount?: number;
  notes?: string | null;
}

export interface ProjectFinancialSummary {
  contractValue: number;
  totalPaid: number;
  remainingBalance: number;
  totalExpenses: number;
  genericExpensesTotal: number;
  collaboratorFeesTotal: number;
  netProfit: number;
  profitMarginPercent: number;
  isFullyPaid: boolean;
  canNormalClose: boolean;
}
