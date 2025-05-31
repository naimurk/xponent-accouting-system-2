/* eslint-disable @typescript-eslint/no-explicit-any */
export function extractZodErrorMessages(errorObject: any): string[] {
  const messages: string[] = [];

  function recurse(obj: any) {
    if (typeof obj !== "object" || obj === null) return;

    // Collect _errors if they exist and contain messages
    if (Array.isArray(obj._errors)) {
      messages.push(...obj._errors);
    }

    for (const key in obj) {
      if (key !== "_errors") {
        recurse(obj[key]);
      }
    }
  }

  recurse(errorObject);
  return messages;
}
