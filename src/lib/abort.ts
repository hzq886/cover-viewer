type AbortSignalWithTimeout = typeof AbortSignal & {
  timeout?: (ms: number) => AbortSignal;
};

const abortSignalWithTimeout = AbortSignal as AbortSignalWithTimeout;

export const timeoutSignal = (ms: number): AbortSignal | undefined => {
  const withTimeout = abortSignalWithTimeout.timeout;
  return typeof withTimeout === "function" ? withTimeout(ms) : undefined;
};
