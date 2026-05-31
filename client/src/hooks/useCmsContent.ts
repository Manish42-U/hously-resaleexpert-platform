import { useEffect, useRef, useState } from 'react';
import { cmsService } from '../services/api';

export const useCmsContent = <T extends Record<string, any>>(key: string, fallback: T) => {
  const [content, setContent] = useState<T>(fallback);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    let mounted = true;

    cmsService.getByKey(key)
      .then((response) => {
        const data = response.data?.data?.content;
        if (mounted && data && typeof data === 'object') {
          setContent({ ...fallbackRef.current, ...data });
        }
      })
      .catch(() => {
        if (mounted) {
          setContent(fallbackRef.current);
        }
      });

    return () => {
      mounted = false;
    };
  }, [key]);

  return content;
};
