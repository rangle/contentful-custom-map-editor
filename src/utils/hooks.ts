import { useCallback, useEffect } from "react";

type ModifierKeys = "Alt" | "Control" | "Shift";
type WhitespaceKeys = "Enter" | "Tab" | " ";
type ControlKeys = "Backspace" | "Delete";
type NavigationKeys =
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "End"
  | "Home"
  | "PageDown"
  | "PageUp";

type EscapeKeys = "Escape";

type Key =
  | ControlKeys
  | ModifierKeys
  | WhitespaceKeys
  | NavigationKeys
  | EscapeKeys;

export function useKeyDown(callback: () => void, keyCodes: Key[]): void {
  const handler = useCallback(
    ({ code }: KeyboardEvent) => {
      if (keyCodes.includes(code as Key)) {
        callback();
      }
    },
    [callback, keyCodes]
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [handler]);
}

export function useKeyEvent(
  [keydownCb, keyUpCb]: readonly [() => void, () => void],
  keyCodes: Key[]
): void {
  const handlerKd = useCallback(
    ({ code }: KeyboardEvent) => {
      console.log("DOWN", code);
      if (keyCodes.includes(code as Key)) {
        keydownCb();
      }
    },
    [keydownCb, keyCodes]
  );
  const handlerKu = useCallback(
    ({ code }: KeyboardEvent) => {
      console.log("UP", code);
      if (keyCodes.includes(code as Key)) {
        keyUpCb();
      }
    },
    [keyUpCb, keyCodes]
  );

  useEffect(() => {
    window.addEventListener("keydown", handlerKd);
    window.addEventListener("keyup", handlerKu);
    return () => {
      window.removeEventListener("keydown", handlerKd);
      window.removeEventListener("keydown", handlerKu);
    };
  }, [handlerKu, handlerKd]);
}
