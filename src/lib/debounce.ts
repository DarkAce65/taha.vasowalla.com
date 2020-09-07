interface DebounceOptions {
  delay?: number;
}

interface DebouncedFunction<Inputs extends unknown[]> {
  (...args: Inputs): void;
  readonly now: (...args: Inputs) => void;
}

const debounce = <Inputs extends unknown[]>(
  func: (...args: Inputs) => void,
  { delay = 500 }: DebounceOptions = {}
): DebouncedFunction<Inputs> => {
  let timeout: number;

  const debouncedFunction = function (...args: Inputs): void {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), delay);
  };
  debouncedFunction.now = function (...args: Inputs): void {
    window.clearTimeout(timeout);
    func(...args);
  };

  return debouncedFunction;
};

export default debounce;
