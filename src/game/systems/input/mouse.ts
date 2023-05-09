export type MouseCallbackId = number & { __mouseCallbackId: void };

interface BaseListener {
  key: MouseCallbackId;
}

interface ClickListener extends BaseListener {
  area: BoundingBox | BoundingCircle;
  callback: (x: number, y: number) => void;
}

interface HoverListener extends BaseListener {
  area: BoundingBox | BoundingCircle;
  callback: () => void;
}

interface MoveListener extends BaseListener {
  callback: (x: number, y: number) => void;
}

export type BoundingBox = {
  type: "box";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BoundingCircle = {
  type: "circle";
  x: number;
  y: number;
  radius: number;
};

const createCallbackId = (num: number) => num as MouseCallbackId;

export const createMouseSystem = ({
  canvas,
}: {
  canvas: HTMLCanvasElement;
}) => {
  const hoverIn: HoverListener[] = [];
  const hoverOut: HoverListener[] = [];
  const click: ClickListener[] = [];
  const move: MoveListener[] = [];

  let backlog: VoidFunction[] = [];
  let lastMove: { x: number; y: number } | null = null;

  const hovering: Set<MouseCallbackId> = new Set();

  let nextId = 1;

  const convertScreenToCanvasCoordinates = (x: number, y: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((x - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((y - rect.top) / (rect.bottom - rect.top)) * canvas.height,
    };
  };

  const mouseMoveHandler: (e: globalThis.MouseEvent) => void = (
    e: globalThis.MouseEvent
  ) => {
    const { x, y } = convertScreenToCanvasCoordinates(e.clientX, e.clientY);
    lastMove = { x, y };
  };

  const clickHandler = (e: globalThis.MouseEvent) => {
    const { x, y } = convertScreenToCanvasCoordinates(e.clientX, e.clientY);
    for (let i = 0; i < click.length; i++) {
      const { area: box, callback } = click[i];
      if (box.type === "box") {
        if (
          x >= box.x &&
          x <= box.x + box.width &&
          y >= box.y &&
          y <= box.y + box.height
        )
          backlog.push(() => callback(x, y));
      } else {
        if (
          Math.sqrt(Math.pow(box.x - x, 2) + Math.pow(box.y - y, 2)) <=
          box.radius
        ) {
          backlog.push(() => callback(x, y));
        }
      }
    }
  };

  window.addEventListener("mousemove", mouseMoveHandler);
  window.addEventListener("click", clickHandler);

  return {
    update: () => {
      if (lastMove) {
        for (let i = 0; i < move.length; i++)
          move[i].callback(lastMove.x, lastMove.y);

        for (const id of hovering) {
          const { area: box } = hoverIn.find((h) => h.key === id)!;
          if (box.type === "box") {
            if (
              lastMove.x < box.x ||
              lastMove.x > box.x + box.width ||
              lastMove.y < box.y ||
              lastMove.y > box.y + box.height
            ) {
              hovering.delete(id);
              const callback = hoverOut.find((h) => h.key === id)!.callback;
              backlog.push(callback);
            }
          } else {
            if (
              Math.sqrt(
                Math.pow(box.x - lastMove.x, 2) +
                  Math.pow(box.y - lastMove.y, 2)
              ) > box.radius
            ) {
              hovering.delete(id);
              const callback = hoverOut.find((h) => h.key === id)!.callback;
              backlog.push(callback);
            }
          }
        }
        for (let i = 0; i < hoverIn.length; i++) {
          const { area: box, callback } = hoverIn[i];
          if (hovering.has(hoverIn[i].key)) continue;
          if (box.type === "box") {
            if (
              lastMove.x >= box.x &&
              lastMove.x <= box.x + box.width &&
              lastMove.y >= box.y &&
              lastMove.y <= box.y + box.height
            ) {
              backlog.push(callback);
              hovering.add(hoverIn[i].key);
            }
          } else {
            if (
              Math.sqrt(
                Math.pow(box.x - lastMove.x, 2) +
                  Math.pow(box.y - lastMove.y, 2)
              ) <= box.radius
            ) {
              backlog.push(callback);
              hovering.add(hoverIn[i].key);
            }
          }
        }

        lastMove = null;
      }

      for (let i = 0; i < backlog.length; i++) backlog[i]();
      backlog = [];
    },
    onHover: (props: {
      in: () => void;
      out: () => void;
      area: BoundingBox | BoundingCircle;
    }) => {
      const id = createCallbackId(nextId++);
      hoverIn.push({
        key: id,
        area: props.area,
        callback: props.in,
      });
      hoverOut.push({
        key: id,
        area: props.area,
        callback: props.out,
      });
    },
    onMove: (props: { callback: (x: number, y: number) => void }) => {
      const id = createCallbackId(nextId++);
      move.push({
        key: id,
        callback: props.callback,
      });
    },
    onClick: (props: {
      callback: (x: number, y: number) => void;
      area: BoundingBox | BoundingCircle;
    }) => {
      const id = createCallbackId(nextId++);
      const listener = {
        key: id,
        type: "click",
        area: props.area,
        callback: props.callback,
      };

      click.push(listener);
      return id;
    },
    unsubscribe: (
      type: "hover-in" | "hover-out" | "click" | "move",
      id: MouseCallbackId
    ) => {
      const array =
        type === "move"
          ? move
          : type === "click"
          ? click
          : type === "hover-in"
          ? hoverIn
          : hoverOut;
      const index = array.findIndex((listener) => listener.key === id);
      if (index !== -1) array.splice(index, 1);
    },
    dispose: () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("click", clickHandler);
    },
  };
};

export type MouseSystem = ReturnType<typeof createMouseSystem>;
