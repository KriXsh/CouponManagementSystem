let io = null;

export const initialize = (socketIo) => {
    io = socketIo;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Must call .initialize(server) before you can call .getIO()");
    }
    return io;
};

export const emitMessageToRoom = (room, eventEmitterName, messageBody) => {
    io.to(room).emit(eventEmitterName, messageBody);
};