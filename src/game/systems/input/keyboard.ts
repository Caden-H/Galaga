import { getFromStorage, saveToStorage } from "../localStorage";

export type KeyboardCallbackId = number & { __keyboardCallbackId: void };

type KeyMapEntry = {
  key: KeyboardCallbackId;
  type: "keydown" | "repeat" | "keyup";
  callback: (key: string, deltaTime: number) => void;
};

const createCallbackId = (num: number) => num as KeyboardCallbackId;

export type Key = "left" | "right" | "fire" | "exit" | "up" | "down" | "select";

const checkMatches = (key: string, expected: string) => {
  if (expected === "*") return true;
  if (expected === "Space" && key === " ") return true;
  return key === expected;
};

const mapKey = (key: string, map: KeyMapping): Key | null => {
  if (checkMatches(key, map.left)) return "left";
  if (checkMatches(key, map.right)) return "right";
  if (checkMatches(key, map.fire)) return "fire";
  if (checkMatches(key, map.exit)) return "exit";
  if (checkMatches(key, map.up)) return "up";
  if (checkMatches(key, map.down)) return "down";
  if (checkMatches(key, map.select)) return "select";
  return null;
};

const mapStarKey = (key: string) => {
  if (key === " ") return "Space";
  return key;
};

export type KeyMapping = Record<Key, string>;

export const defaultKeyMapping: KeyMapping = {
  left: "ArrowLeft",
  right: "ArrowRight",
  fire: "Space",
  exit: "Escape",
  up: "ArrowUp",
  down: "ArrowDown",
  select: "Enter",
};

const STORAGE_KEY = "galaga-input-key-mapping";

export const updateKeyMapping = (newMapping: Partial<KeyMapping>) => {
  const keyMapping = getFromStorage<KeyMapping>({
    key: STORAGE_KEY,
    defaultValue: defaultKeyMapping,
  });
  const combinedMapping: KeyMapping = { ...keyMapping, ...newMapping };
  saveToStorage<KeyMapping>({
    key: STORAGE_KEY,
    value: combinedMapping,
  });
  return combinedMapping;
};

export const createKeyboardSystem = () => {
  let keyMapping = getFromStorage<KeyMapping>({
    key: STORAGE_KEY,
    defaultValue: defaultKeyMapping,
  });

  const keyCallbacks = new Map<Key | "*", KeyMapEntry[]>();

  const keydownKeys = new Set<string>();
  const repeatKeys = new Set<string>();
  const keyupKeys = new Set<string>();

  let nextId = 1;

  const keydownListener = (event: KeyboardEvent) => {
    if (event.repeat) return;
    keydownKeys.add(event.key);
  };

  const keyupListener = (event: KeyboardEvent) => {
    keydownKeys.delete(event.key);
    repeatKeys.delete(event.key);
    keyupKeys.add(event.key);
  };

  window.addEventListener("keydown", keydownListener);
  window.addEventListener("keyup", keyupListener);

  return {
    update: (deltaTime: number) => {
      const downKeysArray = [...keydownKeys.keys()];
      for (let i = 0; i < downKeysArray.length; i++) {
        const key = downKeysArray[i];
        const mappedKey = mapKey(key, keyMapping);
        const callbacks = mappedKey ? keyCallbacks.get(mappedKey) || [] : [];
        const starCallbacks = keyCallbacks.get("*") || [];
        for (let j = 0; j < callbacks.length; j++)
          if (callbacks[j].type !== "keyup") callbacks[j].callback(mappedKey!, deltaTime);
        for (let j = 0; j < starCallbacks.length; j++)
          if (starCallbacks[j].type !== "keyup")
            starCallbacks[j].callback(mapStarKey(key), deltaTime);
        keydownKeys.delete(key);
        repeatKeys.add(key);
      }

      const releasedKeysArray = [...keyupKeys.keys()];
      for (let i = 0; i < releasedKeysArray.length; i++) {
        const key = releasedKeysArray[i];
        const mappedKey = mapKey(key, keyMapping);
        const callbacks = mappedKey ? keyCallbacks.get(mappedKey) || [] : [];
        const starCallbacks = keyCallbacks.get("*") || [];
        for (let j = 0; j < callbacks.length; j++)
          if (callbacks[j].type === "keyup") callbacks[j].callback(mappedKey!, deltaTime);
        for (let j = 0; j < starCallbacks.length; j++)
          if (starCallbacks[j].type === "keyup")
            starCallbacks[j].callback(mapStarKey(key), deltaTime);
        repeatKeys.delete(key);
        keyupKeys.delete(key);
      }

      const repeatKeysArray = [...repeatKeys.keys()];
      for (let i = 0; i < repeatKeysArray.length; i++) {
        const key = repeatKeysArray[i];
        const mappedKey = mapKey(key, keyMapping);
        const callbacks = mappedKey ? keyCallbacks.get(mappedKey) || [] : [];
        const starCallbacks = keyCallbacks.get("*") || [];
        for (let j = 0; j < callbacks.length; j++)
          if (callbacks[j].type === "repeat") callbacks[j].callback(mappedKey!, deltaTime);
        for (let j = 0; j < starCallbacks.length; j++)
          if (starCallbacks[j].type === "repeat")
            starCallbacks[j].callback(mapStarKey(key), deltaTime);
      }
    },
    subscribe: ({
      key,
      type,
      callback,
    }: {
      key: Key | "*";
      type: KeyMapEntry["type"];
      callback: KeyMapEntry["callback"];
    }) => {
      const id = createCallbackId(nextId++);
      const currentCallbacks = keyCallbacks.get(key) || [];
      keyCallbacks.set(key, [...currentCallbacks, { key: id, type, callback }]);
      return id;
    },
    unsubscribe: (key: Key | "*", id: number) => {
      const currentCallbacks = keyCallbacks.get(key) || [];
      keyCallbacks.set(
        key,
        currentCallbacks.filter((entry) => entry.key !== id)
      );
    },
    dispose: () => {
      window.removeEventListener("keydown", keydownListener);
      window.removeEventListener("keyup", keyupListener);
    },
    getMapping: () => keyMapping,
    setMapping: (newMapping: Partial<KeyMapping>) => {
      keyMapping = updateKeyMapping(newMapping);
    },
  };
};
