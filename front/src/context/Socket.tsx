import { createContext, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import {useAuth} from "./Auth.tsx";

interface WebSocketContextInterface {
	socket: any;
}

const WebSocketContext = createContext({
	socket: null as any
});

const WebSocketProvider = (props:any) => {
	const { token } = useAuth();
	const socket = io(`ws://localhost:3000?token=${token?.split('"')[1].split('"')[0]}`, { transports: ['websocket'] });
	
	useEffect(() => {
		return () => {
			socket.disconnect();
		};
	}, [socket]);
	
	const value : WebSocketContextInterface = {
		socket
	};
	
	return (
		<WebSocketContext.Provider value={value}>
			{props.children}
		</WebSocketContext.Provider>
	);
};

const useWebSocket = (): WebSocketContextInterface => {
	return useContext(WebSocketContext);
};

export { WebSocketProvider, useWebSocket };
