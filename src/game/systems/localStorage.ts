export const getFromStorage = <T>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: T;
}) => {
  const value = localStorage.getItem(key);
  if (value === null) return defaultValue;
  return JSON.parse(value) as T;
};

export const saveToStorage = <T>({ key, value }: { key: string; value: T }) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeFromStorage = ({ key }: { key: string }) => {
  localStorage.removeItem(key);
};
