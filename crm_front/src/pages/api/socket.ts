import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { prisma } from "@/lib/prisma";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function SocketHandler(req: NextApiRequest, res: any) {
    if (!res.socket.server.io) {
        console.log("Setting up socket.io server");

        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: "/api/socket/",
            addTrailingSlash: false,
        });

        io.on("connection", (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            // Join a personal or group room
            socket.on("join-room", (roomId: string) => {
                socket.join(roomId);
                console.log(`Socket ${socket.id} joined room ${roomId}`);
            });

            socket.on("send-message", async (data: {
                roomId: string;
                senderId: number;
                content: string;
                groupId?: number;
                receiverId?: number;
            }) => {
                try {
                    const message = await prisma.chatMessage.create({
                        data: {
                            content: data.content,
                            senderId: data.senderId,
                            groupId: data.groupId || null,
                            receiverId: data.receiverId || null,
                        },
                        include: {
                            sender: {
                                select: { id: true, name: true, role: { select: { name: true } } }
                            }
                        }
                    } as any);

                    io.to(data.roomId).emit("receive-message", message);
                } catch (error) {
                    console.error("Error saving message", error);
                }
            });

            socket.on("disconnect", () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });

        res.socket.server.io = io;
    }

    res.end();
}
