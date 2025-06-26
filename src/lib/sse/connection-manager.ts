import { NextRequest } from "next/server";

type SSEResponseData = {
  type: string;
  [key: string]: any;
};

export class SSEConnectionManager {
  private connections = new Map<string, Set<ReadableStreamDefaultController<Uint8Array>>>();
  private readonly maxConnectionsPerUser = 3;
  private encoder = new TextEncoder();
  
  addConnection(userId: string, controller: ReadableStreamDefaultController<Uint8Array>): boolean {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    
    const userConnections = this.connections.get(userId)!;
    
    if (userConnections.size >= this.maxConnectionsPerUser) {
      // Close oldest connection by keeping only the most recent connections
      // This effectively drops the oldest connection
      const connectionsArray = Array.from(userConnections);
      const oldestConnection = connectionsArray[0];
      
      try {
        oldestConnection.enqueue(
          this.encoder.encode(`data: ${JSON.stringify({ type: 'disconnect', reason: 'Too many connections' })}\n\n`)
        );
        oldestConnection.close();
      } catch (error) {
        console.error("Error closing old connection:", error);
      }
      
      userConnections.delete(oldestConnection);
    }
    
    userConnections.add(controller);
    return true;
  }
  
  removeConnection(userId: string, controller: ReadableStreamDefaultController<Uint8Array>): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(controller);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }
  
  sendToUser(userId: string, data: SSEResponseData): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      const failedControllers: ReadableStreamDefaultController<Uint8Array>[] = [];
      
      for (const controller of userConnections) {
        try {
          controller.enqueue(this.encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          failedControllers.push(controller);
        }
      }
      
      // Clean up any failed controllers
      failedControllers.forEach(controller => {
        this.removeConnection(userId, controller);
      });
    }
  }
  
  sendHeartbeatToAll(): void {
    const heartbeat = {
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    };
    
    for (const [userId] of this.connections) {
      this.sendToUser(userId, heartbeat);
    }
  }
  
  getConnectionCount(userId: string): number {
    const userConnections = this.connections.get(userId);
    return userConnections ? userConnections.size : 0;
  }
  
  getTotalConnections(): number {
    let total = 0;
    for (const userConnections of this.connections.values()) {
      total += userConnections.size;
    }
    return total;
  }
}

// Create a singleton instance
export const sseConnectionManager = new SSEConnectionManager();

// Start heartbeat interval
setInterval(() => {
  sseConnectionManager.sendHeartbeatToAll();
}, 30000); // Send heartbeat every 30 seconds
