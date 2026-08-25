"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { emitPetEvent } from "@/lib/pet-events";
import { usePetBehavior } from "@/lib/pet-behavior";

type Direction = "left" | "right";

/* PetState now lives in lib/pet-state.ts, with all eight faces. This file
   used to declare its own three, which is exactly why the other five were
   drawn in globals.css and never once appeared on screen. */

type Position = {
  x: number;
  y: number;
};

const PET_WIDTH = 72;
const PET_HEIGHT = 72;

/*
 * How far the pointer may travel and still count as a tap
 * rather than a drag.
 *
 * This was 5px of MANHATTAN distance and it made Byte
 * effectively unclickable for other people. Measured on the
 * live site with real mouse events: a click that moved 3px
 * across and 3px down — an ordinary trackpad click — summed
 * to 6 and was read as a drag, so nothing happened. Adding
 * the axes together double-counts every diagonal wobble,
 * which is the shape a hand actually makes.
 *
 * Straight-line distance now, and roomier: a hand holding a
 * mouse drifts several pixels, and a finger on glass drifts
 * further still. A real drag crosses these in the first
 * few frames anyway.
 */
const TAP_SLOP_MOUSE = 10;
const TAP_SLOP_TOUCH = 16;

const START_POSITION: Position = {
  x: 140,
  y: 220,
};

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(Math.max(value, min), max);
}

export function BytePet() {
  const petRef =
    useRef<HTMLDivElement | null>(null);

  const positionRef =
    useRef<Position>(START_POSITION);

  const dragRef = useRef({
    active: false,
    pointerId: -1,
    offsetX: 0,
    offsetY: 0,
    lastX: START_POSITION.x,

    /*
     * Where the pointer went down, and whether it has
     * since travelled far enough to be a drag.
     *
     * Byte is both a toy you move and a button you press,
     * so releasing has to know which one just happened.
     */
    startX: 0,
    startY: 0,
    moved: false,

    /* A finger is allowed more drift than a mouse. */
    slop: TAP_SLOP_MOUSE,
  });

  const [direction, setDirection] =
    useState<Direction>("right");

  /* Mood, reactions and the study cues all come from here. This component
     still owns exactly what it always owned: where Byte is and whether it is
     being held. */
  const { state, setDragging, react } =
    usePetBehavior();

  /*
   * Keep Byte inside the browser viewport.
   */
  const getBounds = useCallback(() => {
    return {
      minX: 8,

      maxX: Math.max(
        8,
        window.innerWidth -
          PET_WIDTH -
          8
      ),

      minY: 70,

      maxY: Math.max(
        70,
        window.innerHeight -
          PET_HEIGHT -
          12
      ),
    };
  }, []);

  /*
   * Apply position directly to the DOM.
   *
   * This keeps dragging smooth without
   * causing a React render for every move.
   */
  const applyPosition = useCallback(
    (position: Position) => {
      if (!petRef.current) {
        return;
      }

      /* One compositor-only property instead of two layout ones. The element
         stays at left:0/top:0 and is moved from there, so getBoundingClientRect
         still reports where Byte actually is and the drag maths is unchanged. */
      petRef.current.style.transform =
        `translate3d(${position.x}px, ${position.y}px, 0)`;
    },
    []
  );

  /*
   * Start dragging Byte.
   */
  const handlePointerDown = (
    event: React.PointerEvent
  ) => {
    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        "button, a, input, textarea, select"
      )
    ) {
      return;
    }

    event.preventDefault();

    const bounds = getBounds();

    const rect =
      petRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    dragRef.current = {
      active: true,

      pointerId:
        event.pointerId,

      offsetX:
        event.clientX -
        rect.left,

      offsetY:
        event.clientY -
        rect.top,

      lastX:
        positionRef.current.x,

      startX:
        event.clientX,

      startY:
        event.clientY,

      moved: false,

      slop:
        event.pointerType === "touch" ||
        event.pointerType === "pen"
          ? TAP_SLOP_TOUCH
          : TAP_SLOP_MOUSE,
    };

    setDragging(true);

    /*
     * Capture the pointer so dragging continues
     * even when the cursor leaves Byte.
     */
    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    /*
     * Make sure initial position is valid.
     */
    const safePosition = {
      x: clamp(
        positionRef.current.x,
        bounds.minX,
        bounds.maxX
      ),

      y: clamp(
        positionRef.current.y,
        bounds.minY,
        bounds.maxY
      ),
    };

    positionRef.current =
      safePosition;

    applyPosition(
      safePosition
    );
  };

  /*
   * Move Byte while dragging.
   */
  const handlePointerMove = (
    event: React.PointerEvent
  ) => {
    if (
      !dragRef.current.active ||
      dragRef.current.pointerId !==
        event.pointerId
    ) {
      return;
    }

    event.preventDefault();

    /*
     * Measured from where the pointer went down, not from
     * the last move: a slow drag creeps past the threshold
     * one sub-pixel at a time and would never register.
     */
    if (!dragRef.current.moved) {
      const travelled = Math.hypot(
        event.clientX -
          dragRef.current.startX,

        event.clientY -
          dragRef.current.startY
      );

      if (
        travelled > dragRef.current.slop
      ) {
        dragRef.current.moved = true;
      }
    }

    const bounds = getBounds();

    const nextX = clamp(
      event.clientX -
        dragRef.current.offsetX,

      bounds.minX,
      bounds.maxX
    );

    const nextY = clamp(
      event.clientY -
        dragRef.current.offsetY,

      bounds.minY,
      bounds.maxY
    );

    /*
     * Detect horizontal walking direction.
     */
    const difference =
      nextX -
      dragRef.current.lastX;

    if (difference < -1) {
      setDirection("left");
    } else if (difference > 1) {
      setDirection("right");
    }

    dragRef.current.lastX =
      nextX;

    const nextPosition = {
      x: nextX,
      y: nextY,
    };

    positionRef.current =
      nextPosition;

    applyPosition(
      nextPosition
    );
  };

  /*
   * Stop dragging.
   */
  const finishDrag = (
    event: React.PointerEvent
  ) => {
    if (
      !dragRef.current.active ||
      dragRef.current.pointerId !==
        event.pointerId
    ) {
      return;
    }

    dragRef.current.active =
      false;

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      /*
       * Pointer capture may already
       * have been released.
       */
    }

    setDragging(false);

    /*
     * A press that never travelled is a click, and clicking
     * Byte is how you talk to Byte. The pet only announces
     * it — opening the chat, and every cost that comes with
     * it, belongs to whoever is listening.
     */
    if (!dragRef.current.moved) {
      emitPetEvent("pet:open-chat");
    }

  };

  /*
   * Byte has claimed role="button" and tabIndex={0} since the
   * day it was written, which promises a keyboard can press
   * it. Until now nothing listened, so a screen reader
   * announced a button that could not be operated.
   */
  const handleKeyDown = (
    event: React.KeyboardEvent
  ) => {
    if (
      event.key !== "Enter" &&
      event.key !== " "
    ) {
      return;
    }

    event.preventDefault();

    react("happy", 900);

    emitPetEvent("pet:open-chat");
  };

  /*
   * Keep Byte inside the viewport
   * when the browser is resized.
   */
  useEffect(() => {
    const handleResize = () => {
      const bounds = getBounds();

      const current =
        positionRef.current;

      const nextPosition = {
        x: clamp(
          current.x,
          bounds.minX,
          bounds.maxX
        ),

        y: clamp(
          current.y,
          bounds.minY,
          bounds.maxY
        ),
      };

      positionRef.current =
        nextPosition;

      applyPosition(
        nextPosition
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [
    applyPosition,
    getBounds,
  ]);

  /*
   * Set initial position after mount.
   */
  useEffect(() => {
    applyPosition(
      positionRef.current
    );
  }, [applyPosition]);

  return (
    <div
      ref={petRef}
      className={`byte-pet byte-pet-${state} byte-pet-${direction}`}
      role="button"
      tabIndex={0}
      aria-label="Byte — click to chat, drag to move"
      title="Click Byte to chat · drag to move"
      onKeyDown={
        handleKeyDown
      }
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={
        finishDrag
      }
      onPointerCancel={
        finishDrag
      }
      onLostPointerCapture={() => {
        if (dragRef.current.active) {
          dragRef.current.active =
            false;

          setDragging(false);
        }
      }}
    >
      {/* Ground shadow */}
      <div className="byte-pet-shadow" />

      {/* Main Byte body */}
      <div className="byte-pet-body">

        {/* Antenna */}
        <div className="byte-pet-antenna">
          <span />
        </div>

        {/* Ears */}
        <div className="byte-pet-ear byte-pet-ear-left" />

        <div className="byte-pet-ear byte-pet-ear-right" />

        {/* Face */}
        <div className="byte-pet-face">
          <span className="byte-pet-eye" />

          <span className="byte-pet-eye" />

          <span className="byte-pet-mouth" />
        </div>

        {/* Belly */}
        <div className="byte-pet-belly">
          <span>&lt;/&gt;</span>
        </div>

        {/* Feet */}
        <div className="byte-pet-foot byte-pet-foot-left" />

        <div className="byte-pet-foot byte-pet-foot-right" />

      </div>
    </div>
  );
}