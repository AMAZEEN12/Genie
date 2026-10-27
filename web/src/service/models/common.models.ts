export interface FieldError {
  field: string;
  message: string;
}

export interface ProblemModel {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  code?: string;
  requestId?: string;
  errors?: FieldError[];
}
