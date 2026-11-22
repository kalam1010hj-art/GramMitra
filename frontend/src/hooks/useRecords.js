import { useEffect, useState } from "react";
import { api, errorText } from "../services/client";

export function useRecords(url, revision = 0) {
  const [result, setResult] = useState({});
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setResult({});
    api
      .get(url, { signal: controller.signal })
      .then(({ data }) => {
        if (active) setResult({ url, data, fetchedAt: Date.now() });
      })
      .catch((error) => {
        if (active) setResult({ url, error: errorText(error) });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [url, revision]);
  return result.url === url ? result : {};
}
