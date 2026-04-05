import { useState } from "react";

export function useOnChange<T>(callback: () => void, dep: T) {
    const [previous, setPrevious] = useState(dep);
    if (previous !== dep) {
        callback();
        setPrevious(dep);
    }
}
