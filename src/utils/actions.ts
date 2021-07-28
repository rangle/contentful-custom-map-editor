export type Action<T extends string, P = undefined> = PayloadAction<T, P>;

export type PayloadAction<T extends string, P> = {
  type: T;
  payload: P;
};

export const payload =
  <P>() =>
  <T extends string>(type: T) =>
  (payload: P): Action<T, P> => ({
    type,
    payload,
  });

export type PayloadCreator<T extends string, P> = (
  t: T
) => (payload: P) => PayloadAction<T, P>;

export const Action = <T extends string, P = undefined>(
  type: T,
  creator: PayloadCreator<T, P>
) => creator(type);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExportActionTypes<T extends { [K: string]: any }> = ReturnType<
  T[keyof T]
>;

export const ensureNever = (action: never) => action;
