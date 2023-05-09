export type BaseEvent<
  Type extends string,
  Payload extends Record<string, any>
> = {
  type: Type;
  payload: Payload;
};

export type GalagaEvent = BaseEvent<string, Record<string, any>>;

export type EventCallbackEntry = {
  id: EventCallbackId;
  callback: (event: GalagaEvent) => void;
};

export type EventCallbackId = number & { __callbackId: void };
