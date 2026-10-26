/**
 * Backward compatibility re-export wrapper.
 * Canonical auth API and models now live in src/service/api/auth.api and src/service/models/auth.models.
 */
export * from '../service/api/auth.api';
export type {
  LoginRequest,
  Role,
  SessionModel as Session,
  UserModel as User,
} from '../service/models/auth.models';
