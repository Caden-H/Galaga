import { Wave } from "../../../views/gameplay/enemies/waves/wave";

export type NextWave = BaseEvent<
  "NEXT_WAVE",
  {
    waveNumber: number;
    wave: Wave;
  }
>;
