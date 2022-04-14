declare global {
  interface Window {
    electron: {
      web3: {
        newDebate: any;
        newFragment: any;
      }
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
