export interface SupabaseAuthResponse {
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly user?: SupabaseUser;
  readonly error?: string;
  readonly error_description?: string;
  readonly details?: string;
  readonly message?: string;
  readonly msg?: string;
}

export interface SupabaseUser {
  readonly id: string;
  readonly email?: string;
}

export interface SupabaseRequestOptions {
  readonly accessToken?: string;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
  readonly method?: "DELETE" | "GET" | "PATCH" | "POST";
  readonly serviceRole?: boolean;
}
