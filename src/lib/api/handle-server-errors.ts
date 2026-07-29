import { type UseFormReturn, type FieldValues } from "react-hook-form";

interface BackendError {
  field: string;
  messages: string[];
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: BackendError[];
    };
  };
}

export function handleServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormReturn<T>["setError"],
  toast: (message: string, type?: "success" | "error" | "warning" | "info", duration?: number) => void,
  fallbackMessage: string
): void {
  const error = err as ErrorResponse;
  const backendErrors = error.response?.data?.errors;

  if (backendErrors && Array.isArray(backendErrors)) {
    backendErrors.forEach(({ field, messages }) => {
      if (messages?.length) {
        setError(field as any, { type: "server", message: messages[0] });
      }
    });
  } else {
    toast(error.response?.data?.message || fallbackMessage, "error");
  }
}
