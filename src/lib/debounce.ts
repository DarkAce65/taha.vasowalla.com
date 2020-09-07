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
  let timeout = null;

  const debouncedFunction = function (...args: Inputs): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.call(this, ...args), delay);
  };
  debouncedFunction.now = function (...args: Inputs): void {
    clearTimeout(timeout);
    func.call(this, ...args);
  };

  return debouncedFunction;
};

export default debounce;
