const loadAudio = (filename: string): Promise<HTMLAudioElement> => {
  const element = document.createElement("audio");
  element.src = `./assets/audio/${filename}`;
  element.preload = "auto";
  return new Promise((resolve, reject) => {
    element.oncanplaythrough = () => {
      resolve(element);
    };
    element.onerror = () => {
      reject(`Could not load audio ${filename}`);
    };
  });
};

type PlayOptions = {
  key: AudioKey;
  loop?: boolean;
  volume?: number;
  stopAll?: boolean;
};

export type AudioApi = {
  play: ({
    key,
    loop,
    volume,
    stopAll,
  }: {
    key: AudioKey;
    loop?: boolean;
    volume?: number;
    stopAll?: boolean;
  }) => Promise<boolean>;
  stopAll: () => void;
};

type AudioKey =
  | "input"
  | "enemy-die"
  | "player-die"
  | "fire"
  | "coin-credit"
  | "background";

const soundFiles: { key: AudioKey; filename: string }[] = [
  { key: "input", filename: "input.wav" },
  { key: "enemy-die", filename: "enemy-die.wav" },
  { key: "player-die", filename: "player-die.wav" },
  { key: "fire", filename: "fire.wav" },
  { key: "coin-credit", filename: "coin-credit.wav" },
  { key: "background", filename: "background.mp3" },
];

export const initializeAudio = async () => {
  const sounds: [AudioKey, HTMLAudioElement][] = await Promise.all(
    soundFiles.map(async ({ filename, key }) => {
      const sound = await loadAudio(filename);
      return [key, sound];
    })
  );
  const map: Map<AudioKey, HTMLAudioElement> = new Map(sounds);

  const api: AudioApi = {
    stopAll: () => {
      map.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    },
    play: async ({
      key,
      loop = false,
      volume = 0.5,
      stopAll = false,
    }: PlayOptions) => {
      if (stopAll)
        map.forEach((audio, thisKey) => {
          if (thisKey === key) return;
          audio.pause();
          audio.currentTime = 0;
        });
      const audio = map.get(key);
      if (!audio) throw new Error(`Could not find audio ${key}`);
      if (audio.currentTime > 0 && !loop) audio.currentTime = 0;
      audio.loop = loop;
      audio.volume = volume;
      try {
        await audio.play();
        return true;
      } catch (err) {
        return false;
      }
    },
  };
  audio = api;
};

let audio: AudioApi | undefined;

export const Audio = (): AudioApi =>
  audio || { play: () => Promise.resolve(false), stopAll: () => {} };
