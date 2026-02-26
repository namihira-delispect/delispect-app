export type LoginFormState = {
  error?: string;
  fieldErrors?: {
    username?: string[];
    password?: string[];
  };
};
