import { useEffect, useState, createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';

const socket: Socket = io(`${API_BASE_URL}`, {
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

export function useSolutionStatusUpdates(solutionId: string, onStatusUpdate: (data: any) => void) {
    useEffect(() => {
        socket.emit('join', { room: `solution_${solutionId}` });
        socket.on('solution_status_updated', (data) => {
            console.log('Solution status updated:', data);
            onStatusUpdate(data);
        });

        return () => {
            socket.emit('leave', { room: `solution_${solutionId}` });
            socket.off('solution_status_updated');
        };
    }, [solutionId, onStatusUpdate]);
}

export function useChallengeStatusUpdates(challengeId: string, onStatusUpdate: (data: any) => void) {
    useEffect(() => {
        socket.emit('join', { room: `challenge_${challengeId}` });
        socket.on('solution_status_updated', (data) => {
            console.log('Challenge solution updated:', data);
            onStatusUpdate(data);
        });

        return () => {
            socket.emit('leave', { room: `challenge_${challengeId}` });
            socket.off('solution_status_updated');
        };
    }, [challengeId, onStatusUpdate]);
}


const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket} >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
}
