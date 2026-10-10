import { useEffect, useState } from "react";

// 自实现的防抖 Hook：在 delay 毫秒内值不再变化后才更新返回值
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
