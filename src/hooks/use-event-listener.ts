import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for adding event listeners with automatic cleanup
 * 
 * @param eventName - Name of the event to listen for
 * @param handler - Event handler function
 * @param element - Element to attach listener to (default: window)
 * @param options - Event listener options
 * 
 * @example
 * // Listen for clicks on window
 * useEventListener('click', (e) => console.log('clicked', e));
 * 
 * // Listen for scroll with options
 * useEventListener('scroll', handleScroll, window, { passive: true });
 * 
 * // Listen on specific element
 * const ref = useRef<HTMLDivElement>(null);
 * useEventListener('mouseenter', handleHover, ref.current);
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: HTMLElement | null,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element: HTMLElement | Document | Window | null = window,
  options?: boolean | AddEventListenerOptions
): void {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);
  
  // Update ref.current value if handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    // Make sure element supports addEventListener
    if (!element || !element.addEventListener) {
      return;
    }
    
    // Create event listener that calls handler function stored in ref
    const eventListener = (event: Event) => savedHandler.current(event);
    
    // Add event listener
    element.addEventListener(eventName, eventListener, options);
    
    // Remove event listener on cleanup
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Hook for keyboard events with key filtering
 */
export function useKeyPress(
  targetKey: string | string[],
  handler: (event: KeyboardEvent) => void,
  options?: {
    element?: HTMLElement | Document | Window | null;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  }
) {
  const {
    element = window,
    preventDefault = false,
    stopPropagation = false,
    ctrlKey,
    shiftKey,
    altKey,
    metaKey
  } = options || {};
  
  const keys = Array.isArray(targetKey) ? targetKey : [targetKey];
  
  useEventListener('keydown', (event: Event) => {
    const e = event as KeyboardEvent;
    
    // Check if key matches
    if (!keys.includes(e.key)) return;
    
    // Check modifier keys
    if (ctrlKey !== undefined && e.ctrlKey !== ctrlKey) return;
    if (shiftKey !== undefined && e.shiftKey !== shiftKey) return;
    if (altKey !== undefined && e.altKey !== altKey) return;
    if (metaKey !== undefined && e.metaKey !== metaKey) return;
    
    if (preventDefault) {
      e.preventDefault();
    }
    
    if (stopPropagation) {
      e.stopPropagation();
    }
    
    handler(e);
  }, element as any);
}

/**
 * Hook for click outside detection
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
  options?: {
    enabled?: boolean;
    mouseEvent?: 'mousedown' | 'mouseup' | 'click';
    touchEvent?: 'touchstart' | 'touchend';
  }
) {
  const {
    enabled = true,
    mouseEvent = 'mousedown',
    touchEvent = 'touchstart'
  } = options || {};
  
  useEventListener(
    mouseEvent,
    (event) => {
      if (!enabled || !ref.current) return;
      
      // Check if click was outside the element
      if (!ref.current.contains(event.target as Node)) {
        handler(event as MouseEvent);
      }
    }
  );
  
  useEventListener(
    touchEvent,
    (event) => {
      if (!enabled || !ref.current) return;
      
      // Check if touch was outside the element
      if (!ref.current.contains(event.target as Node)) {
        handler(event as TouchEvent);
      }
    }
  );
}

/**
 * Hook for media query changes
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const mediaQueryList = useRef<MediaQueryList | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    mediaQueryList.current = window.matchMedia(query);
    setMatches(mediaQueryList.current.matches);
  }, [query]);
  
  useEventListener(
    'change',
    (event) => {
      setMatches((event as MediaQueryListEvent).matches);
    },
    mediaQueryList.current as any
  );
  
  return matches;
}

/**
 * Hook for window resize events with debouncing
 */
export function useWindowSize(debounceMs = 100) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEventListener('resize', () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, debounceMs);
  });
  
  return windowSize;
}

/**
 * Hook for scroll position
 */
export function useScrollPosition(
  element?: HTMLElement | null,
  throttleMs = 100
) {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0,
  });
  
  const lastUpdate = useRef(0);
  const rafId = useRef<number>();
  
  const updatePosition = useCallback(() => {
    const target = element || window;
    const x = element ? element.scrollLeft : window.scrollX;
    const y = element ? element.scrollTop : window.scrollY;
    
    setScrollPosition({ x, y });
    lastUpdate.current = Date.now();
  }, [element]);
  
  useEventListener(
    'scroll',
    () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdate.current;
      
      if (timeSinceLastUpdate >= throttleMs) {
        updatePosition();
      } else {
        rafId.current = requestAnimationFrame(updatePosition);
      }
    },
    element as any,
    { passive: true }
  );
  
  return scrollPosition;
}

/**
 * Hook for page visibility changes
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(
    typeof document !== 'undefined' ? !document.hidden : true
  );
  
  useEventListener('visibilitychange', () => {
    setIsVisible(!document.hidden);
  }, typeof document !== 'undefined' ? document : null as any);
  
  return isVisible;
}

/**
 * Hook for online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  useEventListener('online', () => setIsOnline(true));
  useEventListener('offline', () => setIsOnline(false));
  
  return isOnline;
}

