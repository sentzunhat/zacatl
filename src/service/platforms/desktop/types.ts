/**
 * Configuration for Desktop-type services
 */
export type ConfigDesktop = {
  /** Window configuration */
  window: {
    /** Window title */
    title: string;

    /** Initial window width */
    width: number;

    /** Initial window height */
    height: number;

    /** Whether window is resizable */
    resizable?: boolean;

    /** Minimum width (optional) */
    minWidth?: number;

    /** Minimum height (optional) */
    minHeight?: number;
  };

  /** Desktop platform/runtime */
  platform: "neutralino" | "electron";
};
