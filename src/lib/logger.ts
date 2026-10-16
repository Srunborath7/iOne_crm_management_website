export const logger = {
  error(message: string, details?: unknown) {
    console.error(`[ERROR] ${message}`);

    if (details instanceof Error) {
      console.error("Message:", details.message);
      console.error("Stack:", details.stack);
    } else {
      console.dir(details, { depth: 5 });
    }
  },
};
