import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  store: {
    get(val: any) {
      return ipcRenderer.sendSync('electron-store-get', val);
    },
    set(property: string, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
  web3: {
    newDebate: (id: string) =>
      ipcRenderer.invoke('web3:newDebate', id),
    newFragment: (id: string) =>
      ipcRenderer.invoke('web3:newFragment', id),
  },
  recorders: {
    initNewDebateRecord: (id: string) => {
      ipcRenderer.send('debateRecord:init', id);
    },
    saveDebateRecordPart: (d: any) =>
      ipcRenderer.invoke('debateRecord:newPart', d),
    initNewFragmentRecord: (id: string) => {
      ipcRenderer.send('fragmentRecord:init', id);
    },
    saveFragmentRecordPart: (d: any) =>
      ipcRenderer.invoke('fragmentRecord:newPart', d),
    dropFragmentRecordParts: (id: string) => {
      ipcRenderer.send('fragmentRecord:drop', id);
    },
  },
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
          func(...args);
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, subscription);

        return () => ipcRenderer.removeListener(channel, subscription);
      }

      return undefined;
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      }
    },
  },
});
