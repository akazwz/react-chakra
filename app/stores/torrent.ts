import { create } from "zustand";

import type { TorrentInfo } from "~/gen/torrent/v1/torrent_pb";

interface TorrentState {
	torrentInfo: TorrentInfo | null;
	setTorrentInfo: (info: TorrentInfo | null) => void;
}
export const useTorrentStore = create<TorrentState>()((set) => ({
	torrentInfo: null,
	setTorrentInfo: (info) => set({ torrentInfo: info }),
}));
