import type * as Party from "partykit/server";

type PlayerState = {
  x: number; z: number; rot: number;
  color: string;
};

export default class Room implements Party.Server {
  constructor(readonly room: Party.Room) {}

  players: Record<string, PlayerState> = {};

  onConnect(conn: Party.Connection) {
    // Send all current players to the newcomer
    conn.send(JSON.stringify({ type: "world", players: this.players }));
  }

  onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message as string) as { type: string } & Partial<PlayerState>;

    if (msg.type === "pos") {
      this.players[sender.id] = {
        x: msg.x ?? 0,
        z: msg.z ?? 0,
        rot: msg.rot ?? 0,
        color: msg.color ?? "#7cf3c8",
      };
      // Relay position to everyone else
      this.room.broadcast(
        JSON.stringify({ type: "pos", id: sender.id, x: msg.x, z: msg.z, rot: msg.rot, color: msg.color }),
        [sender.id]
      );
    }
  }

  onClose(conn: Party.Connection) {
    delete this.players[conn.id];
    this.room.broadcast(JSON.stringify({ type: "leave", id: conn.id }));
  }
}
