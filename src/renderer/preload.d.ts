declare global {
  interface Window {
    electron: {
      recorders: {
        initNewDebateRecord: any;
        saveDebateRecordPart: any;
        initNewFragmentRecord: any;
        saveFragmentRecordPart: any;
        dropFragmentRecordParts: any;
      };
      ipcRenderer: {
        myPing(): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
