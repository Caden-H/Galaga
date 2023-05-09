import { EventCallbackEntry, EventCallbackId, GalagaEvent } from "./types";

const createCallbackId = (num: number) => num as EventCallbackId;

export const createEventSystem = () => {
  let nextId = 1;
  const subscriptions = new Map<GalagaEvent["type"], EventCallbackEntry[]>();

  const unsubscribe = (unsubscribeOptions: {
    type: GalagaEvent["type"];
    id: EventCallbackId;
  }) => {
    const currentSubscriptions = subscriptions.get(unsubscribeOptions.type);
    if (!currentSubscriptions) return;
    subscriptions.set(
      unsubscribeOptions.type,
      currentSubscriptions.filter(
        (subscription) => subscription.id !== unsubscribeOptions.id
      )
    );
  };

  return {
    subscribe: <EventType extends GalagaEvent>(subscribeOptions: {
      type: EventType["type"];
      callback: (event: EventType) => void;
    }) => {
      const id = createCallbackId(nextId++);
      subscriptions.set(subscribeOptions.type, [
        ...(subscriptions.get(subscribeOptions.type) || []),
        {
          id,
          callback: subscribeOptions.callback as EventCallbackEntry["callback"],
        },
      ]);
      return () => {
        unsubscribe({
          type: subscribeOptions.type,
          id,
        });
      };
    },
    publish: <EventType extends GalagaEvent>(event: EventType) => {
      const currentSubscriptions = subscriptions.get(event.type);
      if (!currentSubscriptions) return;
      currentSubscriptions.forEach((subscription) =>
        subscription.callback(event)
      );
    },
  };
};

export type EventSystem = ReturnType<typeof createEventSystem>;
